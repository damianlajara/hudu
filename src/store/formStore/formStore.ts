import type {
  FieldId,
  FieldValue,
  StepFormData,
  StepId,
  WizardFormData,
} from '@/types/wizard';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import type { FormStore, FormStoreState } from './formStore.types';

const initialState: FormStoreState = {
  formData: {},
  isDirty: false,
  hasUnsavedChanges: false,
  savedProgress: null,
};

export const createFormStore = () =>
  create<FormStore>()(
    devtools(
      (set, get) => ({
        ...initialState,

        actions: {
          updateFormData: <T extends StepFormData>(
            stepId: StepId,
            data: Partial<T>
          ) => {
            set((state) => ({
              formData: {
                ...state.formData,
                [stepId]: {
                  ...state.formData[stepId],
                  ...data,
                },
              },
              hasUnsavedChanges: true,
            }));
          },

          getFormData: <T extends StepFormData>(
            stepId: StepId
          ): T | undefined => {
            const state = get();
            return state.formData[stepId] as T | undefined;
          },

          getFieldValue: <T>(
            stepId: StepId,
            fieldId: FieldId
          ): T | undefined => {
            const state = get();
            const stepData = state.formData[stepId];

            if (!stepData) return undefined;

            return stepData[fieldId] as T;
          },

          setFieldValue: (
            stepId: StepId,
            fieldId: FieldId,
            value: FieldValue
          ) => {
            const state = get();
            const currentData = state.formData[stepId] || {};
            state.actions.updateFormData(stepId, {
              ...currentData,
              [fieldId]: value,
            });
          },

          markStepDirty: (_stepId: StepId, isDirty: boolean) => {
            set({
              isDirty: isDirty,
              hasUnsavedChanges: isDirty,
            });
          },

          resetStepForm: (stepId: StepId) => {
            set((state) => ({
              formData: {
                ...state.formData,
                [stepId]: {},
              },
            }));
          },

          resetAllForms: () => {
            set({
              formData: {},
              isDirty: false,
              hasUnsavedChanges: false,
            });
          },

          saveProgress: (navigationState?: {
            currentStepIndex: number;
            currentSectionId: string;
            lastCompletedStepIndex: number;
          }) => {
            const state = get();

            const progressData = {
              formData: state.formData,
              navigationState: navigationState || {
                currentStepIndex: 0,
                currentSectionId: 'section-1',
                lastCompletedStepIndex: -1,
              },
              timestamp: new Date().toISOString(),
            };

            console.log('Progress saved:', progressData);

            set({
              hasUnsavedChanges: false,
              savedProgress: progressData,
            });
          },

          restoreProgress: (data: WizardFormData) => {
            set({
              formData: { ...get().formData, ...data },
              hasUnsavedChanges: false,
            });
          },

          getSavedProgress: () => {
            const state = get();
            return state.savedProgress;
          },

          restoreFromSaved: () => {
            const state = get();
            if (state.savedProgress) {
              set({
                formData: state.savedProgress.formData,
                hasUnsavedChanges: false,
              });
              return state.savedProgress.navigationState;
            }
            return null;
          },
        },

        selectors: {
          getFormData: (state) => state.formData,
          getIsDirty: (state) => state.isDirty,
          getHasUnsavedChanges: (state) => state.hasUnsavedChanges,
        },
      }),
      { name: 'form-store' }
    )
  );

export const useFormStore = createFormStore();

export const useFormData = () =>
  useFormStore(useShallow((state) => state.selectors.getFormData(state)));

export const useFormDirtyState = () =>
  useFormStore(
    useShallow((state) => ({
      isDirty: state.selectors.getIsDirty(state),
      hasUnsavedChanges: state.selectors.getHasUnsavedChanges(state),
    }))
  );

export const useFormActions = () => useFormStore((state) => state.actions);

import type { WizardFormData, WizardSection, WizardStep } from '@/types/wizard';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { vi } from 'vitest';

import type { FormActions } from '@/store/formStore/formStore.types';
import type { NavigationActions } from '@/store/navigationStore/navigationStore.types';
import type { StepsActions } from '@/store/stepsStore/stepsStore.types';

export const defaultMockSteps: WizardStep[] = [
  {
    id: 'step-1',
    title: 'Select Criteria Type',
    sectionId: 'section-1',
    fields: [
      {
        id: 'criteria-type',
        type: 'single-select',
        label: 'What type of criteria do you want to monitor?',
        isRequired: true,
        options: [
          { id: 'record', label: 'Record', value: 'record', isSelected: false },
          { id: 'user', label: 'User', value: 'user', isSelected: false },
        ],
      },
    ],
    isValid: false,
  },
  {
    id: 'step-2',
    title: 'Select Record Types',
    sectionId: 'section-1',
    fields: [
      {
        id: 'recordTypes',
        type: 'multi-select',
        label: 'Which record types should be monitored?',
        isRequired: true,
        allowSelectAll: true,
        options: [
          {
            id: 'password',
            label: 'Password',
            value: 'password',
            isSelected: false,
          },
          {
            id: 'process',
            label: 'Process',
            value: 'process',
            isSelected: false,
          },
          { id: 'asset', label: 'Asset', value: 'asset', isSelected: false },
        ],
      },
    ],
    isValid: false,
  },
  {
    id: 'step-3',
    title: 'Select Triggers',
    sectionId: 'section-2',
    fields: [
      {
        id: 'triggers',
        type: 'multi-select',
        label: 'When should the workflow be triggered?',
        isRequired: true,
        allowSelectAll: true,
        options: [
          {
            id: 'recordCreated',
            label: 'Record Created',
            value: 'recordCreated',
            isSelected: false,
          },
          {
            id: 'recordUpdated',
            label: 'Record Updated',
            value: 'recordUpdated',
            isSelected: false,
          },
          {
            id: 'recordDeleted',
            label: 'Record Deleted',
            value: 'recordDeleted',
            isSelected: false,
          },
        ],
      },
    ],
    isValid: false,
  },
  {
    id: 'step-4',
    title: 'Select Actions',
    sectionId: 'section-2',
    fields: [
      {
        id: 'actions',
        type: 'multi-select',
        label: 'What actions should be performed?',
        isRequired: true,
        allowSelectAll: true,
        options: [
          {
            id: 'flag',
            label: 'Flag Record',
            value: 'flag',
            isSelected: false,
          },
          {
            id: 'email',
            label: 'Send Email',
            value: 'email',
            isSelected: false,
          },
          {
            id: 'webhook',
            label: 'Call Webhook',
            value: 'webhook',
            isSelected: false,
          },
        ],
      },
    ],
    isValid: false,
  },
];

export const defaultMockSections: WizardSection[] = [
  {
    id: 'section-1',
    title: 'Setup',
    stepIds: ['step-1', 'step-2'],
    isCompleted: false,
    isActive: true,
  },
  {
    id: 'section-2',
    title: 'Configuration',
    stepIds: ['step-3'],
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'section-3',
    title: 'Review',
    stepIds: ['step-4'],
    isCompleted: false,
    isActive: false,
  },
];

export const defaultMockProgressState = [
  { isCompleted: true, isActive: true, isVisited: true },
  { isCompleted: true, isActive: false, isVisited: true },
  { isCompleted: false, isActive: false, isVisited: false },
  { isCompleted: false, isActive: false, isVisited: false },
];

export const defaultMockNavigationState = {
  currentStepIndex: 0,
  currentSectionId: 'section-1',
  hasUnsavedChanges: false,
  lastCompletedStepIndex: -1,
};

export const defaultMockFormData = {
  'step-1': { 'criteria-type': 'record' },
  'step-2': { recordTypes: ['Password', 'Process'] },
  'step-3': { triggers: ['Record Created', 'Record Updated'] },
  'step-4': { actions: ['Flag Record', 'Send Email'] },
};

// Mock implementations
export const mockGoNext = vi.fn();
export const mockGoBack = vi.fn();
export const mockGoToStep = vi.fn();
export const mockGoToSection = vi.fn();
export const mockCanNavigateToStep = vi.fn();
export const mockSetHasUnsavedChanges = vi.fn();
export const mockSetLastCompletedStepIndex = vi.fn();
export const mockRestoreNavigationState = vi.fn();
export const mockMarkStepCompleted = vi.fn();
export const mockGetLastCompletedStepIndex = vi.fn();
export const mockIsStepCompleted = vi.fn();
export const mockClearVisitedSteps = vi.fn();

export const mockGetSectionById = vi.fn();
export const mockMarkStepValid = vi.fn();
export const mockResetSteps = vi.fn();
export const mockUpdateFieldSelection = vi.fn();
export const mockToggleSelectAll = vi.fn();
export const mockGetStepById = vi.fn();
export const mockUpdateSectionState = vi.fn();
export const mockGetStepsForSection = vi.fn();
export const mockSetLoading = vi.fn();
export const mockSetSteps = vi.fn();
export const mockSetSections = vi.fn();

export const mockUpdateFormData = vi.fn();
export const mockGetFormData = vi.fn();
export const mockGetFieldValue = vi.fn();
export const mockSetFieldValue = vi.fn();
export const mockMarkStepDirty = vi.fn();
export const mockResetStepForm = vi.fn();
export const mockResetAllForms = vi.fn();
export const mockSaveProgress = vi.fn();
export const mockRestoreProgress = vi.fn();
export const mockGetSavedProgress = vi.fn();
export const mockRestoreFromSaved = vi.fn();

export const mockTrigger = vi.fn();
export const mockGetValues = vi.fn();
export const mockReset = vi.fn();
export const mockSetValue = vi.fn();

export function createMockFormContext(): UseFormReturn<FieldValues> {
  const formState = {
    isValid: true,
    errors: {},
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    defaultValues: {},
    disabled: false,
    isReady: true,
  };

  const control = {
    register: vi.fn(),
    unregister: vi.fn(),
  } as unknown as UseFormReturn<FieldValues>['control'];

  return {
    trigger: mockTrigger,
    getValues: mockGetValues,
    reset: mockReset,
    setValue: mockSetValue,
    watch: vi.fn() as UseFormReturn<FieldValues>['watch'],
    formState,
    handleSubmit: vi.fn((onValid) => async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      await onValid({});
    }) as UseFormReturn<FieldValues>['handleSubmit'],
    control,
    register: vi.fn((name) => ({
      name,
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    })) as UseFormReturn<FieldValues>['register'],
    unregister: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    setFocus: vi.fn(),
    getFieldState: vi.fn(() => ({
      invalid: false,
      isDirty: false,
      isTouched: false,
      isValidating: false,
      error: undefined,
    })) as UseFormReturn<FieldValues>['getFieldState'],
    resetField: vi.fn(),
    subscribe: vi.fn(),
  };
}

export const mockStoreHooks = {
  useFormData: vi.fn((): WizardFormData => defaultMockFormData),
  useCurrentStepIndex: vi.fn(
    (): number => defaultMockNavigationState.currentStepIndex
  ),
  useCurrentSectionId: vi.fn(
    (): string => defaultMockNavigationState.currentSectionId
  ),
  useStepsStore: vi.fn((): { steps: WizardStep[] } => ({
    steps: defaultMockSteps,
  })),
  useSections: vi.fn((): WizardSection[] => defaultMockSections),
  useNavigationState: vi.fn(() => ({
    canGoNext: true,
    canGoBack: false,
    isFirstStep: true,
    isLastStep: false,
    canNavigateToStep: mockCanNavigateToStep,
    lastCompletedStepIndex: -1,
  })),
  useProgressState: vi.fn(() => defaultMockProgressState),
  useFormActions: vi.fn(
    (): FormActions => ({
      updateFormData: mockUpdateFormData,
      getFormData: mockGetFormData,
      getFieldValue: mockGetFieldValue,
      setFieldValue: mockSetFieldValue,
      markStepDirty: mockMarkStepDirty,
      resetStepForm: mockResetStepForm,
      resetAllForms: mockResetAllForms,
      saveProgress: mockSaveProgress,
      restoreProgress: mockRestoreProgress,
      getSavedProgress: mockGetSavedProgress,
      restoreFromSaved: mockRestoreFromSaved,
    })
  ),
  useNavigationActions: vi.fn(
    (): NavigationActions => ({
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      goToSection: mockGoToSection,
      canNavigateToStep: mockCanNavigateToStep,
      setHasUnsavedChanges: mockSetHasUnsavedChanges,
      setLastCompletedStepIndex: mockSetLastCompletedStepIndex,
      restoreNavigationState: mockRestoreNavigationState,
      markStepCompleted: mockMarkStepCompleted,
      getLastCompletedStepIndex: mockGetLastCompletedStepIndex,
      isStepCompleted: mockIsStepCompleted,
      clearVisitedSteps: mockClearVisitedSteps,
    })
  ),
  useStepsActions: vi.fn(
    (): StepsActions => ({
      getSectionById: mockGetSectionById,
      markStepValid: mockMarkStepValid,
      resetSteps: mockResetSteps,
      updateFieldSelection: mockUpdateFieldSelection,
      toggleSelectAll: mockToggleSelectAll,
      getStepById: mockGetStepById,
      updateSectionState: mockUpdateSectionState,
      getStepsForSection: mockGetStepsForSection,
      setLoading: mockSetLoading,
      setSteps: mockSetSteps,
      setSections: mockSetSections,
    })
  ),
  useFormContext: vi.fn(
    (): UseFormReturn<FieldValues> => createMockFormContext()
  ),
};

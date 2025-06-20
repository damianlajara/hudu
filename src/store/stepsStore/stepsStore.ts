import type {
  FieldId,
  SectionId,
  StepId,
  WizardSection,
  WizardStep,
} from '@/types/wizard';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { StepsStore, StepsStoreState } from './stepsStore.types';

const createMockSteps = (): WizardStep[] => [
  {
    id: 'step-1',
    title: 'What will this workflow be based on?',
    sectionId: 'section-1',
    isValid: false,
    fields: [
      {
        id: 'criteria-type',
        type: 'single-select',
        label: 'Select your criteria type',
        isRequired: true,
        options: [
          {
            id: 'company',
            label: 'Company',
            value: 'company',
            isSelected: false,
            icon: 'building',
          },
          {
            id: 'record',
            label: 'Record',
            value: 'record',
            isSelected: false,
            icon: 'file',
          },
          {
            id: 'website',
            label: 'Website',
            value: 'website',
            isSelected: false,
            icon: 'globe',
          },
          {
            id: 'expiration',
            label: 'Expiration',
            value: 'expiration',
            isSelected: false,
            icon: 'calendar-times',
          },
          {
            id: 'user',
            label: 'User',
            value: 'user',
            isSelected: false,
            icon: 'user',
          },
          {
            id: 'group',
            label: 'Group',
            value: 'group',
            isSelected: false,
            icon: 'users',
          },
          {
            id: 'integration',
            label: 'Integration',
            value: 'integration',
            isSelected: false,
            icon: 'plug',
          },
        ],
      },
    ],
  },
  {
    id: 'step-2',
    title: 'Which record type(s) should be included?',
    sectionId: 'section-1',
    isValid: false,
    fields: [
      {
        id: 'recordTypes',
        type: 'multi-select',
        label: 'Select your record types',
        isRequired: true,
        allowSelectAll: true,
        minSelections: 1,
        options: [
          {
            id: 'password',
            label: 'Password',
            value: 'password',
            isSelected: false,
            icon: 'key',
          },
          {
            id: 'companyKbArticle',
            label: 'Company KB article',
            value: 'companyKbArticle',
            isSelected: false,
            icon: 'book',
          },
          {
            id: 'centralKbArticle',
            label: 'Central KB article',
            value: 'centralKbArticle',
            isSelected: false,
            icon: 'file',
          },
          {
            id: 'process',
            label: 'Process',
            value: 'process',
            isSelected: false,
            icon: 'cog',
          },
          {
            id: 'website',
            label: 'Website',
            value: 'website',
            isSelected: false,
            icon: 'globe',
          },
          {
            id: 'rack',
            label: 'Rack',
            value: 'rack',
            isSelected: false,
            icon: 'server',
          },
          {
            id: 'network',
            label: 'Network',
            value: 'network',
            isSelected: false,
            icon: 'desktop',
          },
          {
            id: 'asset',
            label: 'Asset',
            value: 'asset',
            isSelected: false,
            icon: 'archive',
          },
        ],
      },
    ],
  },
  {
    id: 'step-3',
    title: 'What should trigger this workflow?',
    sectionId: 'section-2',
    isValid: false,
    fields: [
      {
        id: 'triggers',
        type: 'multi-select',
        label: 'Configure workflow triggers',
        isRequired: true,
        allowSelectAll: false,
        minSelections: 1,
        allowAddMore: true,
        options: [
          {
            id: 'recordCreated',
            label: 'Record Created',
            value: 'recordCreated',
            isSelected: false,
            icon: 'plus',
          },
          {
            id: 'recordUpdated',
            label: 'Record Updated',
            value: 'recordUpdated',
            isSelected: false,
            icon: 'edit',
          },
        ],
      },
    ],
  },
  {
    id: 'step-4',
    title: 'What should happen once the workflow begins?',
    description:
      'Select at least 1 action to continue. You can add additional actions later.',
    sectionId: 'section-3',
    isValid: false,
    fields: [
      {
        id: 'actions',
        type: 'multi-select',
        label: 'Select actions',
        isRequired: true,
        allowSelectAll: false,
        minSelections: 1,
        options: [
          {
            id: 'flag',
            label: 'Add Flag',
            value: 'flag',
            isSelected: false,
            icon: 'flag',
          },
          {
            id: 'email',
            label: 'Send email',
            value: 'email',
            isSelected: false,
            icon: 'envelope',
          },
          {
            id: 'webhook',
            label: 'Send webhook',
            value: 'webhook',
            isSelected: false,
            icon: 'external-link-alt',
          },
        ],
      },
    ],
  },
  {
    id: 'step-5',
    title: 'Review your workflow below. Click a step to make edits if needed.',
    sectionId: 'section-4',
    isValid: true,
    fields: [],
  },
];

const createMockSections = (): WizardSection[] => [
  {
    id: 'section-1',
    title: 'Criteria',
    stepIds: ['step-1', 'step-2'],
    isCompleted: false,
    isActive: true,
  },
  {
    id: 'section-2',
    title: 'Trigger',
    stepIds: ['step-3'],
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'section-3',
    title: 'Action',
    stepIds: ['step-4'],
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'section-4',
    title: 'Review',
    stepIds: ['step-5'],
    isCompleted: false,
    isActive: false,
  },
];

const initialState: StepsStoreState = {
  steps: createMockSteps(),
  sections: createMockSections(),
  isLoading: false,
};

export const createStepsStore = () =>
  create<StepsStore>()(
    devtools(
      (set, get) => ({
        ...initialState,

        actions: {
          markStepValid: (stepId: StepId, isValid: boolean) => {
            set((state) => ({
              steps: state.steps.map((step) =>
                step.id === stepId ? { ...step, isValid } : step
              ),
            }));
          },

          resetSteps: () => {
            set({
              steps: createMockSteps(),
              sections: createMockSections(),
            });
          },

          updateFieldSelection: (
            stepId: StepId,
            fieldId: FieldId,
            selections: string[]
          ) => {
            set((state) => ({
              steps: state.steps.map((step) => {
                if (step.id === stepId) {
                  const updatedFields = step.fields.map((field) => {
                    if (field.id === fieldId) {
                      const updatedOptions = field.options.map((option) => ({
                        ...option,
                        isSelected: selections.includes(option.value),
                      }));
                      return { ...field, options: updatedOptions };
                    }
                    return field;
                  });
                  return { ...step, fields: updatedFields };
                }
                return step;
              }),
            }));
          },

          toggleSelectAll: (stepId: StepId, fieldId: FieldId) => {
            const state = get();
            const step = state.steps.find((s) => s.id === stepId);
            const field = step?.fields.find((f) => f.id === fieldId);

            if (field && field.allowSelectAll) {
              const allSelected = field.options.every((opt) => opt.isSelected);
              const newSelections = allSelected
                ? []
                : field.options.map((opt) => opt.value);

              state.actions.updateFieldSelection(
                stepId,
                fieldId,
                newSelections
              );
            }
          },

          updateSectionState: (
            sectionId: SectionId,
            updates: Partial<Omit<WizardSection, 'id'>>
          ) => {
            set((state) => ({
              sections: state.sections.map((section) =>
                section.id === sectionId ? { ...section, ...updates } : section
              ),
            }));
          },

          getStepById: (stepId: StepId) => {
            const state = get();
            return state.steps.find((step) => step.id === stepId);
          },

          getSectionById: (sectionId: SectionId) => {
            const state = get();
            return state.sections.find((section) => section.id === sectionId);
          },

          getStepsForSection: (sectionId: SectionId) => {
            const state = get();
            const section = state.sections.find((s) => s.id === sectionId);
            if (!section) return [];

            return state.steps.filter((step) =>
              section.stepIds.includes(step.id)
            );
          },

          setLoading: (isLoading: boolean) => {
            set({ isLoading });
          },

          setSteps: (steps: WizardStep[]) => {
            set({ steps });
          },

          setSections: (sections: WizardSection[]) => {
            set({ sections });
          },
        },

        selectors: {
          getSteps: (state) => state.steps,
          getSections: (state) => state.sections,
          getIsLoading: (state) => state.isLoading,
          getStepById: (state, stepId: StepId) =>
            state.steps.find((step) => step.id === stepId),
          getSectionById: (state, sectionId: SectionId) =>
            state.sections.find((section) => section.id === sectionId),
        },
      }),
      { name: 'steps-store' }
    )
  );

export const useStepsStore = createStepsStore();

export const useSteps = () =>
  useStepsStore(useShallow((state) => state.selectors.getSteps(state)));

export const useSections = () =>
  useStepsStore(useShallow((state) => state.selectors.getSections(state)));

export const useStepsLoading = () =>
  useStepsStore((state) => state.selectors.getIsLoading(state));

export const useStepsActions = () => useStepsStore((state) => state.actions);

export const useStepById = (stepId: StepId) =>
  useStepsStore((state) => state.actions.getStepById(stepId));

export const useSectionById = (sectionId: SectionId) =>
  useStepsStore((state) => state.actions.getSectionById(sectionId));

export const useStepsForSection = (sectionId: SectionId) =>
  useStepsStore((state) => state.actions.getStepsForSection(sectionId));

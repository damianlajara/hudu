import type {
  FieldId,
  SectionId,
  StepId,
  WizardSection,
  WizardStep,
} from '@/types/wizard';

export interface StepsStoreState {
  steps: WizardStep[];
  sections: WizardSection[];
  isLoading: boolean;
}

export interface StepsActions {
  markStepValid: (stepId: StepId, isValid: boolean) => void;
  resetSteps: () => void;

  updateFieldSelection: (
    stepId: StepId,
    fieldId: FieldId,
    selections: string[]
  ) => void;
  toggleSelectAll: (stepId: StepId, fieldId: FieldId) => void;

  updateSectionState: (
    sectionId: SectionId,
    updates: Partial<Omit<WizardSection, 'id'>>
  ) => void;

  getStepById: (stepId: StepId) => WizardStep | undefined;
  getSectionById: (sectionId: SectionId) => WizardSection | undefined;
  getStepsForSection: (sectionId: SectionId) => WizardStep[];

  setLoading: (isLoading: boolean) => void;

  setSteps: (steps: WizardStep[]) => void;
  setSections: (sections: WizardSection[]) => void;
}

export type StepsStore = StepsStoreState & {
  actions: StepsActions;
  selectors: {
    getSteps: (state: StepsStoreState) => WizardStep[];
    getSections: (state: StepsStoreState) => WizardSection[];
    getIsLoading: (state: StepsStoreState) => boolean;
    getStepById: (
      state: StepsStoreState,
      stepId: StepId
    ) => WizardStep | undefined;
    getSectionById: (
      state: StepsStoreState,
      sectionId: SectionId
    ) => WizardSection | undefined;
  };
};

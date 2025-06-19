import type {
  FieldId,
  StepFormData,
  StepId,
  WizardFormData,
} from '@/types/wizard';

export interface SavedProgressData {
  formData: WizardFormData;
  navigationState: {
    currentStepIndex: number;
    currentSectionId: string;
    lastCompletedStepIndex: number;
  };
  timestamp: string;
}

export interface FormStoreState {
  formData: WizardFormData;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  savedProgress: SavedProgressData | null;
}

export interface FormActions {
  updateFormData: <T extends StepFormData>(
    stepId: StepId,
    data: Partial<T>
  ) => void;
  getFormData: <T extends StepFormData>(stepId: StepId) => T | undefined;
  getFieldValue: <T>(stepId: StepId, fieldId: FieldId) => T | undefined;
  setFieldValue: <T>(stepId: StepId, fieldId: FieldId, value: T) => void;

  markStepDirty: (stepId: StepId, isDirty: boolean) => void;
  resetStepForm: (stepId: StepId) => void;
  resetAllForms: () => void;

  saveProgress: (navigationState?: {
    currentStepIndex: number;
    currentSectionId: string;
    lastCompletedStepIndex: number;
  }) => void;
  restoreProgress: (data: WizardFormData) => void;
  getSavedProgress: () => SavedProgressData | null;
  restoreFromSaved: () => {
    currentStepIndex: number;
    currentSectionId: string;
    lastCompletedStepIndex: number;
  } | null;
}

export type FormStore = FormStoreState & {
  actions: FormActions;
  selectors: {
    getFormData: (state: FormStoreState) => WizardFormData;
    getIsDirty: (state: FormStoreState) => boolean;
    getHasUnsavedChanges: (state: FormStoreState) => boolean;
  };
};

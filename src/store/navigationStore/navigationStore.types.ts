import type { WizardSection, WizardStep } from '@/types/wizard';

export interface NavigationState {
  hasUnsavedChanges: boolean;
  lastCompletedStepIndex: number;
}

export interface NavigationStoreState extends NavigationState {
  currentStepIndex: number;
  currentSectionId: string;
  visitedValidSteps: Set<number>;
}

export interface NavigationActions {
  goNext: (steps: WizardStep[]) => void;
  goBack: (steps: WizardStep[]) => void;
  goToStep: (stepIndex: number, steps: WizardStep[]) => boolean;
  goToSection: (
    sectionId: string,
    steps: WizardStep[],
    sections: WizardSection[]
  ) => boolean;

  canNavigateToStep: (stepIndex: number) => boolean;

  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  setLastCompletedStepIndex: (index: number) => void;
  restoreNavigationState: (navigationState: {
    currentStepIndex: number;
    currentSectionId: string;
    lastCompletedStepIndex: number;
  }) => void;

  markStepCompleted: (stepIndex: number) => void;
  getLastCompletedStepIndex: () => number;
  isStepCompleted: (stepIndex: number) => boolean;
  clearVisitedSteps: () => void;
}

export type NavigationStore = NavigationStoreState & {
  actions: NavigationActions;
  selectors: {
    getCurrentStepIndex: (state: NavigationStoreState) => number;
    getCurrentSectionId: (state: NavigationStoreState) => string;
    getNavigationState: (state: NavigationStoreState) => NavigationState;
  };
};

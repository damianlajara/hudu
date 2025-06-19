import type { WizardSection, WizardStep } from '@/types/wizard';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type {
  NavigationState,
  NavigationStore,
  NavigationStoreState,
} from './navigationStore.types';

const initialState: NavigationStoreState = {
  currentStepIndex: 0,
  currentSectionId: 'section-1',
  hasUnsavedChanges: false,
  lastCompletedStepIndex: -1,
  visitedValidSteps: new Set<number>(),
};

export const createNavigationStore = () =>
  create<NavigationStore>()(
    devtools(
      (set, get) => ({
        ...initialState,
        actions: {
          goNext: (steps: WizardStep[]) => {
            const state = get();
            if (state.currentStepIndex >= steps.length - 1) {
              return;
            }

            const newIndex = state.currentStepIndex + 1;
            const newStep = steps[newIndex];

            const newVisitedSteps = new Set(state.visitedValidSteps);
            newVisitedSteps.add(state.currentStepIndex);

            set({
              currentStepIndex: newIndex,
              currentSectionId: newStep.sectionId,
              visitedValidSteps: newVisitedSteps,
            });
          },

          goBack: (steps: WizardStep[]) => {
            const state = get();
            if (state.currentStepIndex <= 0) {
              return;
            }

            const newIndex = state.currentStepIndex - 1;
            const newStep = steps[newIndex];

            set({
              currentStepIndex: newIndex,
              currentSectionId: newStep.sectionId,
            });
          },

          goToStep: (stepIndex: number, steps: WizardStep[]) => {
            const state = get();

            if (stepIndex < 0 || stepIndex >= steps.length) {
              return false;
            }

            if (!state.actions.canNavigateToStep(stepIndex)) {
              return false;
            }

            const newStep = steps[stepIndex];
            set({
              currentStepIndex: stepIndex,
              currentSectionId: newStep.sectionId,
            });

            return true;
          },

          goToSection: (
            sectionId: string,
            steps: WizardStep[],
            sections: WizardSection[]
          ) => {
            const section = sections.find((s) => s.id === sectionId);

            if (!section || section.stepIds.length === 0) {
              return false;
            }

            const firstStepId = section.stepIds[0];
            const stepIndex = steps.findIndex(
              (step) => step.id === firstStepId
            );

            if (stepIndex < 0) {
              return false;
            }

            return get().actions.goToStep(stepIndex, steps);
          },

          canNavigateToStep: (stepIndex: number) => {
            const state = get();
            if (stepIndex === state.currentStepIndex) {
              return true;
            }
            if (stepIndex < state.currentStepIndex) {
              return true;
            }
            if (state.visitedValidSteps.has(stepIndex)) {
              return true;
            }
            return false;
          },

          setHasUnsavedChanges: (hasUnsavedChanges: boolean) => {
            set({ hasUnsavedChanges });
          },

          setLastCompletedStepIndex: (index: number) => {
            set({ lastCompletedStepIndex: index });
          },

          restoreNavigationState: (navigationState: {
            currentStepIndex: number;
            currentSectionId: string;
            lastCompletedStepIndex: number;
          }) => {
            set({
              currentStepIndex: navigationState.currentStepIndex,
              currentSectionId: navigationState.currentSectionId,
              lastCompletedStepIndex: navigationState.lastCompletedStepIndex,
            });
          },

          markStepCompleted: (stepIndex: number) => {
            const state = get();
            const newSet = new Set(state.visitedValidSteps);
            newSet.add(stepIndex);
            set({ visitedValidSteps: newSet });
          },

          getLastCompletedStepIndex: () => {
            const state = get();
            return state.visitedValidSteps.size === 0
              ? -1
              : Math.max(...Array.from(state.visitedValidSteps));
          },

          isStepCompleted: (stepIndex: number) => {
            const state = get();
            return state.visitedValidSteps.has(stepIndex);
          },

          clearVisitedSteps: () => {
            set({ visitedValidSteps: new Set<number>() });
          },
        },

        selectors: {
          getCurrentStepIndex: (state) => state.currentStepIndex,
          getCurrentSectionId: (state) => state.currentSectionId,
          getNavigationState: (state) =>
            ({
              hasUnsavedChanges: state.hasUnsavedChanges,
              lastCompletedStepIndex: state.lastCompletedStepIndex,
            }) as NavigationState,
        },
      }),
      { name: 'navigation-store' }
    )
  );

export const useNavigationStore = createNavigationStore();

export const useCurrentStepIndex = () =>
  useNavigationStore((state) => state.selectors.getCurrentStepIndex(state));

export const useCurrentSectionId = () =>
  useNavigationStore((state) => state.selectors.getCurrentSectionId(state));

export const useNavigationState = () =>
  useNavigationStore(
    useShallow((state) => state.selectors.getNavigationState(state))
  );

export const useNavigationActions = () =>
  useNavigationStore((state) => state.actions);

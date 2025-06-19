import {
  useCurrentStepIndex,
  useNavigationStore,
} from '@/store/navigationStore/navigationStore';
import { useSteps } from '@/store/stepsStore/stepsStore';
import { useFormContext } from 'react-hook-form';

export function useNavigationState() {
  const currentStepIndex = useCurrentStepIndex();
  const steps = useSteps();
  const { visitedValidSteps } = useNavigationStore();

  const formContext = useFormContext();

  const isFormValid = formContext ? formContext.formState.isValid : false;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoBack = !isFirstStep;
  const canGoNext = isFormValid && !isLastStep;

  const canNavigateToStep = (targetStepIndex: number): boolean => {
    if (targetStepIndex === currentStepIndex) {
      return true;
    }
    if (targetStepIndex <= currentStepIndex) {
      return true;
    }
    if (visitedValidSteps.has(targetStepIndex)) {
      return true;
    }
    return false;
  };

  const lastCompletedStepIndex =
    visitedValidSteps.size === 0
      ? -1
      : Math.max(...Array.from(visitedValidSteps));

  return {
    canGoNext,
    canGoBack,
    isFirstStep,
    isLastStep,
    canNavigateToStep,
    lastCompletedStepIndex,
  };
}

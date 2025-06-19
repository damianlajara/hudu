import {
  useCurrentStepIndex,
  useNavigationStore,
} from '@/store/navigationStore/navigationStore';
import { useSteps } from '@/store/stepsStore/stepsStore';

export function useProgressState() {
  const currentStepIndex = useCurrentStepIndex();
  const steps = useSteps();
  const { visitedValidSteps } = useNavigationStore();

  return steps.map((_, index) => {
    const isCompleted = visitedValidSteps.has(index);
    const isActive = index === currentStepIndex;
    const isVisited = index <= currentStepIndex;
    return {
      isCompleted,
      isActive,
      isVisited,
    };
  });
}

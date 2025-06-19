import Button from '@/components/ui/Button';
import { useProgressState } from '@/hooks/useProgressState';
import {
  useCurrentSectionId,
  useNavigationActions,
} from '@/store/navigationStore/navigationStore';
import {
  useSections,
  useSteps,
  useStepsActions,
} from '@/store/stepsStore/stepsStore';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';

export default function ProgressHeader() {
  const currentSectionId = useCurrentSectionId();
  const { goToSection, canNavigateToStep } = useNavigationActions();
  const sections = useSections();
  const steps = useSteps();
  const { getSectionById } = useStepsActions();
  const progressState = useProgressState();

  const handleSectionClick = (sectionId: string) => {
    const section = getSectionById(sectionId);
    if (!section || section.stepIds.length === 0) return;

    const firstStepId = section.stepIds[0];
    const stepIndex = steps.findIndex((step) => step.id === firstStepId);

    if (stepIndex >= 0 && canNavigateToStep(stepIndex)) {
      goToSection(sectionId, steps, sections);
    }
  };

  return (
    <div className="flex w-full items-center px-2">
      {sections.map((section, index) => {
        const isActive = section.id === currentSectionId;
        const sectionStepIndices = section.stepIds
          .map((stepId) => steps.findIndex((step) => step.id === stepId))
          .filter((index) => index >= 0);

        const isCompleted =
          sectionStepIndices.length > 0 &&
          sectionStepIndices.every(
            (stepIndex) => progressState[stepIndex]?.isCompleted
          );

        return (
          <Fragment key={section.id}>
            <div>
              <Button
                onClick={() => handleSectionClick(section.id)}
                size="sm"
                variant="outline"
                className={`text-text-neutral-light-1 relative flex h-8 w-8 flex-shrink-0 rounded-full ${
                  isCompleted
                    ? 'text-text-neutral-dark-1 bg-alert-success hover:bg-alert-success/90 border-alert-success'
                    : isActive
                      ? 'bg-bg-neutral-light-1'
                      : 'bg-bg-neutral-light-disabled hover:bg-gray-300'
                } `}
              >
                {isCompleted && <CheckIcon className="h-4 w-4" />}
              </Button>
              <span className="text-center text-xs">{section.title}</span>
            </div>

            {index < sections.length - 1 && (
              <div className="bg-stroke-neutral-1 mx-2 h-0.25 flex-grow" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

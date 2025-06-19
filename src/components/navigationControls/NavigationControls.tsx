import Button from '@/components/ui/Button';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useFormActions } from '@/store/formStore/formStore';
import {
  useCurrentSectionId,
  useCurrentStepIndex,
  useNavigationActions,
} from '@/store/navigationStore/navigationStore';
import { useStepsStore } from '@/store/stepsStore/stepsStore';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface NavigationControlsProps {
  onSaveDraft?: () => void;
  onSaveAndFinishLater?: () => void;
}

export default function NavigationControls({
  onSaveDraft,
  onSaveAndFinishLater,
}: NavigationControlsProps) {
  const [isValidating, setIsValidating] = useState(false);

  const { trigger, getValues } = useFormContext();

  const currentStepIndex = useCurrentStepIndex();
  const currentSectionId = useCurrentSectionId();
  const { goNext, goBack } = useNavigationActions();

  const { canGoNext, canGoBack, isLastStep, lastCompletedStepIndex } =
    useNavigationState();

  const { steps } = useStepsStore();
  const { saveProgress, updateFormData } = useFormActions();

  const currentStep = steps?.[currentStepIndex];

  if (!steps || !Array.isArray(steps) || !currentStep) {
    return <div>Loading navigation...</div>;
  }

  const handlePrevious = async () => {
    if (!canGoBack) return;
    try {
      goBack(steps);
    } catch (error) {
      console.error('Error navigating to previous step:', error);
    }
  };

  const handleNext = async () => {
    if (!canGoNext) return;

    setIsValidating(true);

    try {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }
      const formData = getValues();
      updateFormData(currentStep.id, formData);
      goNext(steps);
    } catch (error) {
      console.error('Error validating and navigating:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsValidating(true);

    try {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }
      const formData = getValues();
      updateFormData(currentStep.id, formData);
      saveProgress({
        currentStepIndex,
        currentSectionId,
        lastCompletedStepIndex,
      });
      onSaveDraft?.();
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveAndFinishLater = async () => {
    try {
      const formData = getValues();
      updateFormData(currentStep.id, formData);
      saveProgress({
        currentStepIndex,
        currentSectionId,
        lastCompletedStepIndex,
      });
      onSaveAndFinishLater?.();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {canGoBack && (
          <Button
            onClick={handlePrevious}
            disabled={isValidating}
            variant="link"
            size="sm"
            data-testid="nav-previous"
            leadingIcon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSaveAndFinishLater}
          variant="ghost"
          data-testid="nav-save-finish-later"
        >
          Save and Finish Later
        </Button>
        {isLastStep ? (
          <Button
            onClick={handleSaveDraft}
            disabled={isValidating}
            data-testid="nav-save-draft"
          >
            {isValidating ? 'Saving...' : 'Save Draft'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canGoNext || isValidating}
            data-testid="nav-next"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

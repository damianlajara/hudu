import Button from '@/components/ui/Button';
import { useFormActions, useFormData } from '@/store/formStore/formStore';
import {
  useCurrentStepIndex,
  useNavigationActions,
} from '@/store/navigationStore/navigationStore';
import { useStepsStore } from '@/store/stepsStore/stepsStore';
import { createStepSchema } from '@/types/wizard';
import { Description, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import FormField from '../formField/FormField';
import NavigationControls from '../navigationControls/NavigationControls';
import ProgressHeader from '../progressHeader/ProgressHeader';
import ReviewSummary from '../reviewSummary/ReviewSummary';

interface WizardDialogProps {
  onSaveDraft?: () => void;
  onSaveAndFinishLater?: () => void;
  onClose?: () => void;
}

export default function WizardDialog({
  onSaveDraft,
  onSaveAndFinishLater,
  onClose,
}: WizardDialogProps = {}) {
  const currentStepIndex = useCurrentStepIndex();
  const { steps } = useStepsStore();
  const { restoreFromSaved } = useFormActions();
  const { restoreNavigationState } = useNavigationActions();
  const formData = useFormData();
  const currentStep = steps[currentStepIndex];

  const stepSchema = currentStep ? createStepSchema(currentStep) : null;
  const defaultValues = useMemo(() => {
    if (!currentStep) return {};
    const savedData = formData[currentStep.id];
    if (savedData && Object.keys(savedData).length > 0) {
      return savedData;
    }
    return currentStep.fields.reduce(
      (acc, field) => {
        acc[field.id] = field.type === 'single-select' ? '' : [];
        return acc;
      },
      {} as Record<string, unknown>
    );
  }, [currentStep, formData]);

  const methods = useForm({
    defaultValues,
    resolver: stepSchema ? zodResolver(stepSchema) : undefined,
    mode: 'onChange',
  });

  useEffect(() => {
    const savedNavigationState = restoreFromSaved();
    if (savedNavigationState) {
      console.log('Restoring to step:', savedNavigationState.currentStepIndex);
      restoreNavigationState(savedNavigationState);
    }
  }, [restoreFromSaved, restoreNavigationState]);

  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('Submitting form! Step data is valid:', data);
  };

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            Step not found
          </h2>
          <p className="text-gray-600">
            The requested step could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DialogPanel
      className="bg-bg-neutral-light-1 relative w-full max-w-[420px] transform overflow-hidden rounded-lg shadow-sm"
      data-testid="wizard-dialog"
    >
      <FormProvider {...methods}>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
          <div className="flex w-full items-center justify-between gap-2 py-2.5">
            <h1 className="text-sm font-bold">New Workflow</h1>
            <Button
              size="sm"
              variant="ghost"
              className="p-2"
              onClick={onClose ?? (() => null)}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
          <ProgressHeader />

          <div className="flex flex-col justify-between gap-1.5">
            <DialogTitle className="font-regular">
              {currentStep.title}
            </DialogTitle>
            {currentStep.description && (
              <Description className="text-text-neutral-light-2 text-xs">
                {currentStep.description}
              </Description>
            )}
          </div>

          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            data-testid="wizard-form"
          >
            <div className="space-y-8">
              {currentStep.id === 'step-5' ? (
                <ReviewSummary />
              ) : (
                currentStep.fields.map((field) => (
                  <FormField key={field.id} field={field} />
                ))
              )}
            </div>
          </form>
        </div>

        <div className="border-stroke-neutral-1 border-t px-4 py-2">
          <NavigationControls
            onSaveDraft={onSaveDraft}
            onSaveAndFinishLater={onSaveAndFinishLater}
          />
        </div>
      </FormProvider>
    </DialogPanel>
  );
}

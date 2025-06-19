import WizardDialog from '@/components/wizardDialog/WizardDialog';
import { useFormActions, useFormData } from '@/store/formStore/formStore';
import {
  useCurrentSectionId,
  useCurrentStepIndex,
  useNavigationActions,
} from '@/store/navigationStore/navigationStore';
import {
  useSections,
  useStepsActions,
  useStepsStore,
} from '@/store/stepsStore/stepsStore';
import {
  createMockFormContext,
  defaultMockSteps,
  mockRestoreFromSaved,
  mockRestoreNavigationState,
  mockStoreHooks,
} from '@/test/mockUtils';
import { render, screen } from '@/test/testHelpers';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/formStore/formStore');
vi.mock('@/store/navigationStore/navigationStore');
vi.mock('@/store/stepsStore/stepsStore');
vi.mock('react-hook-form');

vi.mock('@/components/formField/FormField', () => ({
  default: ({ field }: { field: { id: string; label: string } }) => (
    <div data-testid={`field-${field.id}`}>
      <label>{field.label}</label>
      <input data-testid={`input-${field.id}`} />
    </div>
  ),
}));

vi.mock('@/components/navigationControls/NavigationControls', () => ({
  default: ({
    onSaveDraft,
    onSaveAndFinishLater,
  }: {
    onSaveDraft?: () => void;
    onSaveAndFinishLater?: () => void;
  }) => (
    <div data-testid="navigation-controls">
      <button onClick={onSaveDraft}>Save Draft</button>
      <button onClick={onSaveAndFinishLater}>Save and Finish Later</button>
    </div>
  ),
}));

vi.mock('@/components/progressHeader/ProgressHeader', () => ({
  default: () => <div data-testid="progress-header">Progress Header</div>,
}));

vi.mock('@/components/reviewSummary/ReviewSummary', () => ({
  default: () => <div data-testid="review-summary">Review Summary</div>,
}));

describe('WizardDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSaveDraft = vi.fn();
  const mockOnSaveAndFinishLater = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFormData).mockReturnValue(mockStoreHooks.useFormData());
    vi.mocked(useFormActions).mockReturnValue(mockStoreHooks.useFormActions());
    vi.mocked(useCurrentStepIndex).mockReturnValue(0);
    vi.mocked(useCurrentSectionId).mockReturnValue('section-1');
    vi.mocked(useNavigationActions).mockReturnValue(
      mockStoreHooks.useNavigationActions()
    );
    vi.mocked(useStepsStore).mockReturnValue({ steps: defaultMockSteps });
    vi.mocked(useSections).mockReturnValue(mockStoreHooks.useSections());
    vi.mocked(useStepsActions).mockReturnValue(
      mockStoreHooks.useStepsActions()
    );
    vi.mocked(FormProvider).mockImplementation(
      ({ children }: { children: React.ReactNode }) => <div>{children}</div>
    );
    vi.mocked(useForm).mockReturnValue(createMockFormContext());
  });

  it('renders wizard dialog content', () => {
    render(<WizardDialog onClose={mockOnClose} />, { withDialog: true });

    expect(screen.getByText('New Workflow')).toBeInTheDocument();
    expect(screen.getByTestId('progress-header')).toBeInTheDocument();
    expect(screen.getByTestId('navigation-controls')).toBeInTheDocument();
  });

  it('renders current step content', () => {
    render(<WizardDialog />, { withDialog: true });

    expect(screen.getByText('Select Criteria Type')).toBeInTheDocument();
  });

  it('renders review summary for last step', () => {
    vi.mocked(useCurrentStepIndex).mockReturnValue(4);
    vi.mocked(useStepsStore).mockReturnValue({
      steps: [
        ...defaultMockSteps,
        {
          id: 'step-5',
          title: 'Review',
          sectionId: 'section-3',
          fields: [],
          isValid: true,
        },
      ],
    });

    render(<WizardDialog />, { withDialog: true });

    expect(screen.getByTestId('review-summary')).toBeInTheDocument();
  });

  it('renders form fields for non-review steps', () => {
    render(<WizardDialog />, { withDialog: true });

    expect(screen.getByTestId('field-criteria-type')).toBeInTheDocument();
  });
  it('passes onSaveDraft prop to NavigationControls', () => {
    render(<WizardDialog onSaveDraft={mockOnSaveDraft} />, {
      withDialog: true,
    });

    const saveDraftButton = screen.getByText('Save Draft');
    saveDraftButton.click();

    expect(mockOnSaveDraft).toHaveBeenCalled();
  });

  it('passes onSaveAndFinishLater prop to NavigationControls', () => {
    render(<WizardDialog onSaveAndFinishLater={mockOnSaveAndFinishLater} />, {
      withDialog: true,
    });

    const finishLaterButton = screen.getByText('Save and Finish Later');
    finishLaterButton.click();

    expect(mockOnSaveAndFinishLater).toHaveBeenCalled();
  });

  describe('Progress Restoration', () => {
    it('calls restoreFromSaved on mount', () => {
      render(<WizardDialog />, { withDialog: true });

      expect(mockRestoreFromSaved).toHaveBeenCalled();
    });

    it('restores navigation state when saved progress exists', () => {
      const savedState = {
        currentStepIndex: 2,
        currentSectionId: 'section-2',
        lastCompletedStepIndex: 1,
      };
      mockRestoreFromSaved.mockReturnValue(savedState);

      render(<WizardDialog />, { withDialog: true });

      expect(mockRestoreNavigationState).toHaveBeenCalledWith(savedState);
    });

    it('does not restore navigation state when no saved progress', () => {
      mockRestoreFromSaved.mockReturnValue(null);

      render(<WizardDialog />, { withDialog: true });

      expect(mockRestoreNavigationState).not.toHaveBeenCalled();
    });
  });
});

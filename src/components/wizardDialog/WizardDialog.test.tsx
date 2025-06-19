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

    vi.mocked(useFormData).mockReturnValue({
      'step-1': { 'criteria-type': 'record' },
      'step-2': { recordTypes: ['Password', 'Process'] },
      'step-3': { triggers: ['Record Created', 'Record Updated'] },
      'step-4': { actions: ['Flag Record', 'Send Email'] },
    });
    vi.mocked(useFormActions).mockReturnValue({
      updateFormData: vi.fn(),
      getFormData: vi.fn(),
      getFieldValue: vi.fn(),
      setFieldValue: vi.fn(),
      markStepDirty: vi.fn(),
      resetStepForm: vi.fn(),
      resetAllForms: vi.fn(),
      saveProgress: vi.fn(),
      restoreProgress: vi.fn(),
      getSavedProgress: vi.fn(),
      restoreFromSaved: mockRestoreFromSaved,
    });
    vi.mocked(useCurrentStepIndex).mockReturnValue(0);
    vi.mocked(useCurrentSectionId).mockReturnValue('section-1');
    vi.mocked(useNavigationActions).mockReturnValue({
      goNext: vi.fn(),
      goBack: vi.fn(),
      goToStep: vi.fn(),
      goToSection: vi.fn(),
      canNavigateToStep: vi.fn(),
      setHasUnsavedChanges: vi.fn(),
      setLastCompletedStepIndex: vi.fn(),
      restoreNavigationState: mockRestoreNavigationState,
      markStepCompleted: vi.fn(),
      getLastCompletedStepIndex: vi.fn(),
      isStepCompleted: vi.fn(),
      clearVisitedSteps: vi.fn(),
    });
    vi.mocked(useStepsStore).mockReturnValue({ steps: defaultMockSteps });
    vi.mocked(useSections).mockReturnValue([
      {
        id: 'section-1',
        title: 'Setup',
        stepIds: ['step-1', 'step-2'],
        isCompleted: false,
        isActive: true,
      },
      {
        id: 'section-2',
        title: 'Configuration',
        stepIds: ['step-3'],
        isCompleted: false,
        isActive: false,
      },
      {
        id: 'section-3',
        title: 'Review',
        stepIds: ['step-4'],
        isCompleted: false,
        isActive: false,
      },
    ]);
    vi.mocked(useStepsActions).mockReturnValue({
      getSectionById: vi.fn(),
      markStepValid: vi.fn(),
      resetSteps: vi.fn(),
      updateFieldSelection: vi.fn(),
      toggleSelectAll: vi.fn(),
      getStepById: vi.fn(),
      updateSectionState: vi.fn(),
      getStepsForSection: vi.fn(),
      setLoading: vi.fn(),
      setSteps: vi.fn(),
      setSections: vi.fn(),
    });
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

import NavigationControls from '@/components/navigationControls/NavigationControls';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useFormActions, useFormData } from '@/store/formStore/formStore';
import {
  useCurrentSectionId,
  useCurrentStepIndex,
  useNavigationActions,
} from '@/store/navigationStore/navigationStore';
import { useStepsStore } from '@/store/stepsStore/stepsStore';
import {
  createMockFormContext,
  defaultMockFormData,
  defaultMockSteps,
  mockCanNavigateToStep,
  mockGoBack,
  mockGoNext,
  mockSaveProgress,
  mockTrigger,
  mockUpdateFormData,
} from '@/test/mockUtils';
import { render, screen, userEvent, waitFor } from '@/test/testHelpers';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/formStore/formStore');
vi.mock('@/hooks/useNavigationState');
vi.mock('@/store/navigationStore/navigationStore');
vi.mock('@/store/stepsStore/stepsStore');
vi.mock('react-hook-form');

describe('NavigationControls', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFormData).mockReturnValue(defaultMockFormData);
    vi.mocked(useFormActions).mockReturnValue({
      updateFormData: mockUpdateFormData,
      getFormData: vi.fn(),
      getFieldValue: vi.fn(),
      setFieldValue: vi.fn(),
      markStepDirty: vi.fn(),
      resetStepForm: vi.fn(),
      resetAllForms: vi.fn(),
      saveProgress: mockSaveProgress,
      restoreProgress: vi.fn(),
      getSavedProgress: vi.fn(),
      restoreFromSaved: vi.fn(),
    });
    vi.mocked(useCurrentStepIndex).mockReturnValue(0);
    vi.mocked(useCurrentSectionId).mockReturnValue('section-1');
    vi.mocked(useStepsStore).mockReturnValue({ steps: defaultMockSteps });
    vi.mocked(useNavigationState).mockReturnValue({
      canGoNext: true,
      canGoBack: false,
      isFirstStep: true,
      isLastStep: false,
      canNavigateToStep: mockCanNavigateToStep,
      lastCompletedStepIndex: -1,
    });
    vi.mocked(useNavigationActions).mockReturnValue({
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: vi.fn(),
      goToSection: vi.fn(),
      canNavigateToStep: mockCanNavigateToStep,
      setHasUnsavedChanges: vi.fn(),
      setLastCompletedStepIndex: vi.fn(),
      restoreNavigationState: vi.fn(),
      markStepCompleted: vi.fn(),
      getLastCompletedStepIndex: vi.fn(),
      isStepCompleted: vi.fn(),
      clearVisitedSteps: vi.fn(),
    });
    vi.mocked(useFormContext).mockReturnValue(createMockFormContext());
    vi.mocked(FormProvider).mockImplementation(
      ({ children }: { children: React.ReactNode }) =>
        children as React.ReactElement
    );
    vi.mocked(useForm).mockReturnValue(createMockFormContext());
  });

  it('renders next button by default', () => {
    render(<NavigationControls />, { formData: {} });

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('shows back button when not on first step', () => {
    vi.mocked(useNavigationState).mockReturnValue({
      canGoNext: true,
      canGoBack: true,
      isFirstStep: false,
      isLastStep: false,
      canNavigateToStep: vi.fn(() => true),
      lastCompletedStepIndex: 0,
    });

    render(<NavigationControls />, { formData: {} });

    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('shows save draft button on last step', () => {
    vi.mocked(useNavigationState).mockReturnValue({
      canGoNext: true,
      canGoBack: true,
      isFirstStep: false,
      isLastStep: true,
      canNavigateToStep: vi.fn(() => true),
      lastCompletedStepIndex: 0,
    });

    render(<NavigationControls />, { formData: {} });

    expect(screen.getByText('Save Draft')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('always shows save and finish later button', () => {
    render(<NavigationControls />, { formData: {} });

    expect(screen.getByText('Save and Finish Later')).toBeInTheDocument();
  });

  describe('Next Button', () => {
    it('calls goNext when next button is clicked with valid form', async () => {
      mockTrigger.mockResolvedValue(true);

      render(<NavigationControls />, { formData: { field1: 'value1' } });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled();
        expect(mockGoNext).toHaveBeenCalledWith(defaultMockSteps);
        expect(mockUpdateFormData).toHaveBeenCalled();
      });
    });

    it('does not navigate when form validation fails', async () => {
      mockTrigger.mockResolvedValue(false);

      render(<NavigationControls />, { formData: {} });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled();
        expect(mockGoNext).not.toHaveBeenCalled();
      });
    });

    it('disables next button when canGoNext is false', () => {
      vi.mocked(useNavigationState).mockReturnValue({
        canGoNext: false,
        canGoBack: false,
        isFirstStep: true,
        isLastStep: false,
        canNavigateToStep: vi.fn(() => true),
        lastCompletedStepIndex: -1,
      });

      render(<NavigationControls />, { formData: {} });

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Back Button', () => {
    it('calls goBack when back button is clicked', async () => {
      vi.mocked(useNavigationState).mockReturnValue({
        canGoNext: true,
        canGoBack: true,
        isFirstStep: false,
        isLastStep: false,
        canNavigateToStep: vi.fn(() => true),
        lastCompletedStepIndex: 0,
      });

      render(<NavigationControls />, { formData: {} });

      const backButton = screen.getByText('Back');
      await user.click(backButton);

      expect(mockGoBack).toHaveBeenCalledWith(defaultMockSteps);
    });

    it('hides back button when canGoBack is false', () => {
      render(<NavigationControls />, { formData: {} });

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('Save Draft', () => {
    it('validates form before saving draft', async () => {
      vi.mocked(useNavigationState).mockReturnValue({
        canGoNext: true,
        canGoBack: true,
        isFirstStep: false,
        isLastStep: true,
        canNavigateToStep: vi.fn(() => true),
        lastCompletedStepIndex: 0,
      });
      mockTrigger.mockResolvedValue(true);

      render(<NavigationControls />, { formData: {} });

      const saveDraftButton = screen.getByText('Save Draft');
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled();
        expect(mockSaveProgress).toHaveBeenCalled();
      });
    });

    it('does not save draft when form validation fails', async () => {
      vi.mocked(useNavigationState).mockReturnValue({
        canGoNext: true,
        canGoBack: true,
        isFirstStep: false,
        isLastStep: true,
        canNavigateToStep: vi.fn(() => true),
        lastCompletedStepIndex: 0,
      });
      mockTrigger.mockResolvedValue(false);

      render(<NavigationControls />, { formData: {} });

      const saveDraftButton = screen.getByText('Save Draft');
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalled();
        expect(mockSaveProgress).not.toHaveBeenCalled();
      });
    });

    it('calls onSaveDraft prop when provided', async () => {
      const mockOnSaveDraft = vi.fn();
      vi.mocked(useNavigationState).mockReturnValue({
        canGoNext: true,
        canGoBack: true,
        isFirstStep: false,
        isLastStep: true,
        canNavigateToStep: vi.fn(() => true),
        lastCompletedStepIndex: 0,
      });
      mockTrigger.mockResolvedValue(true);

      render(<NavigationControls onSaveDraft={mockOnSaveDraft} />, {
        formData: {},
      });

      const saveDraftButton = screen.getByText('Save Draft');
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(mockOnSaveDraft).toHaveBeenCalled();
      });
    });
  });

  describe('Save and Finish Later', () => {
    it('saves progress without validation', async () => {
      render(<NavigationControls />, { formData: {} });

      const finishLaterButton = screen.getByText('Save and Finish Later');
      await user.click(finishLaterButton);

      expect(mockSaveProgress).toHaveBeenCalled();
      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('calls onSaveAndFinishLater prop when provided', async () => {
      const mockOnSaveAndFinishLater = vi.fn();

      render(
        <NavigationControls onSaveAndFinishLater={mockOnSaveAndFinishLater} />,
        {
          formData: {},
        }
      );

      const finishLaterButton = screen.getByText('Save and Finish Later');
      await user.click(finishLaterButton);

      expect(mockOnSaveAndFinishLater).toHaveBeenCalled();
    });
  });
});

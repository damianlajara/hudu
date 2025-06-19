import ProgressHeader from '@/components/progressHeader/ProgressHeader';
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
import {
  defaultMockProgressState,
  defaultMockSections,
  defaultMockSteps,
  mockCanNavigateToStep,
  mockGetSectionById,
  mockGoBack,
  mockGoNext,
  mockGoToSection,
} from '@/test/mockUtils';
import { render, screen, userEvent } from '@/test/testHelpers';
import type { WizardSection } from '@/types/wizard';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useProgressState');
vi.mock('@/store/navigationStore/navigationStore');
vi.mock('@/store/stepsStore/stepsStore');

describe('ProgressHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    mockCanNavigateToStep.mockReturnValue(true);
    mockGetSectionById.mockImplementation((sectionId) =>
      defaultMockSections.find((s) => s.id === sectionId)
    );

    vi.mocked(useProgressState).mockReturnValue(defaultMockProgressState);
    vi.mocked(useCurrentSectionId).mockReturnValue('section-1');
    vi.mocked(useNavigationActions).mockReturnValue({
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: vi.fn(),
      goToSection: mockGoToSection,
      canNavigateToStep: mockCanNavigateToStep,
      setHasUnsavedChanges: vi.fn(),
      setLastCompletedStepIndex: vi.fn(),
      restoreNavigationState: vi.fn(),
      markStepCompleted: vi.fn(),
      getLastCompletedStepIndex: vi.fn(),
      isStepCompleted: vi.fn(),
      clearVisitedSteps: vi.fn(),
    });
    vi.mocked(useSections).mockReturnValue(defaultMockSections);
    vi.mocked(useSteps).mockReturnValue(defaultMockSteps);
    vi.mocked(useStepsActions).mockReturnValue({
      getSectionById: mockGetSectionById,
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
  });

  it('renders all sections', () => {
    render(<ProgressHeader />);

    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders section buttons for each section', () => {
    render(<ProgressHeader />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(defaultMockSections.length);
  });

  describe('Navigation', () => {
    it('calls goToSection when section button is clicked', async () => {
      render(<ProgressHeader />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      expect(mockGoToSection).toHaveBeenCalledWith(
        'section-1',
        defaultMockSteps,
        defaultMockSections
      );
    });

    it('does not navigate when canNavigateToStep returns false', async () => {
      mockCanNavigateToStep.mockReturnValue(false);

      render(<ProgressHeader />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      expect(mockGoToSection).not.toHaveBeenCalled();
    });

    it('handles sections with no steps', async () => {
      const sectionsWithEmptySteps: WizardSection[] = [
        {
          id: 'empty-section',
          title: 'Empty Section',
          stepIds: [],
          isCompleted: false,
          isActive: false,
        },
      ];

      vi.mocked(useSections).mockReturnValue(sectionsWithEmptySteps);

      render(<ProgressHeader />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockGoToSection).not.toHaveBeenCalled();
    });

    it('calls getSectionById when section is clicked', async () => {
      render(<ProgressHeader />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      expect(mockGetSectionById).toHaveBeenCalledWith('section-1');
    });

    it('calls canNavigateToStep to check navigation permission', async () => {
      render(<ProgressHeader />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      expect(mockCanNavigateToStep).toHaveBeenCalledWith(0);
    });
  });
});

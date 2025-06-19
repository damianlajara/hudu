import { renderHook } from '@/test/testHelpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNavigationState } from './useNavigationState';
import { useProgressState } from './useProgressState';

const mockCurrentStepIndex = vi.fn();
const mockVisitedValidSteps = vi.fn();
const mockSteps = [
  {
    id: 'step-1',
    sectionId: 'section-1',
    title: 'Step 1',
    fields: [],
    isValid: false,
  },
  {
    id: 'step-2',
    sectionId: 'section-1',
    title: 'Step 2',
    fields: [],
    isValid: false,
  },
  {
    id: 'step-3',
    sectionId: 'section-2',
    title: 'Step 3',
    fields: [],
    isValid: false,
  },
];
const mockUseSteps = vi.fn();

vi.mock('@/store/stepsStore/stepsStore', () => ({
  useSteps: () => mockUseSteps(),
}));

vi.mock('@/store/navigationStore/navigationStore', () => ({
  useCurrentStepIndex: () => mockCurrentStepIndex(),
  useNavigationStore: () => ({
    visitedValidSteps: mockVisitedValidSteps(),
    currentStepIndex: mockCurrentStepIndex(),
  }),
}));

const mockFormContext = vi.fn();
vi.mock('react-hook-form', () => ({
  useFormContext: () => mockFormContext(),
}));

describe('useNavigationState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mockUseSteps.mockReturnValue(mockSteps);
    mockVisitedValidSteps.mockReturnValue(new Set());
    mockCurrentStepIndex.mockReturnValue(0);
    mockFormContext.mockReturnValue({
      formState: { isValid: true },
    });
  });

  describe('canGoNext logic', () => {
    it('should return true when form is valid and not on last step', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockFormContext.mockReturnValue({
        formState: { isValid: true },
      });

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoNext).toBe(true);
    });

    it('should return false when form is invalid', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockFormContext.mockReturnValue({
        formState: { isValid: false },
      });

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoNext).toBe(false);
    });

    it('should return false when on last step even if form is valid', () => {
      mockCurrentStepIndex.mockReturnValue(2);
      mockFormContext.mockReturnValue({
        formState: { isValid: true },
      });

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoNext).toBe(false);
    });
  });

  describe('canGoBack logic', () => {
    it('should return false when on first step', () => {
      mockCurrentStepIndex.mockReturnValue(0);

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoBack).toBe(false);
    });

    it('should return true when not on first step', () => {
      mockCurrentStepIndex.mockReturnValue(1);

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoBack).toBe(true);
    });
  });

  describe('derived navigation state', () => {
    it('should correctly identify first step', () => {
      mockCurrentStepIndex.mockReturnValue(0);

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
    });

    it('should correctly identify last step', () => {
      mockCurrentStepIndex.mockReturnValue(2);

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should correctly identify middle step', () => {
      mockCurrentStepIndex.mockReturnValue(1);

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe('canNavigateToStep logic', () => {
    it('should allow navigation to current step', () => {
      mockCurrentStepIndex.mockReturnValue(1);
      mockVisitedValidSteps.mockReturnValue(new Set([0]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canNavigateToStep(1)).toBe(true);
    });

    it('should allow navigation to previous steps', () => {
      mockCurrentStepIndex.mockReturnValue(2);
      mockVisitedValidSteps.mockReturnValue(new Set([0]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canNavigateToStep(1)).toBe(true);
      expect(result.current.canNavigateToStep(0)).toBe(true);
    });

    it('should allow navigation to completed future steps', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockVisitedValidSteps.mockReturnValue(new Set([2]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canNavigateToStep(2)).toBe(true);
    });

    it('should prevent navigation to uncompleted future steps', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockVisitedValidSteps.mockReturnValue(new Set([]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canNavigateToStep(2)).toBe(false);
    });
  });

  describe('lastCompletedStepIndex', () => {
    it('should return -1 when no steps are completed', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockVisitedValidSteps.mockReturnValue(new Set([]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.lastCompletedStepIndex).toBe(-1);
    });

    it('should return highest completed step index', () => {
      mockCurrentStepIndex.mockReturnValue(0);
      mockVisitedValidSteps.mockReturnValue(new Set([0, 2, 1]));

      const { result } = renderHook(() => useNavigationState());

      expect(result.current.lastCompletedStepIndex).toBe(2);
    });
  });
});

describe('useProgressState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mockUseSteps.mockReturnValue(mockSteps);
  });

  it('should mark completed steps correctly', () => {
    mockCurrentStepIndex.mockReturnValue(2);
    mockVisitedValidSteps.mockReturnValue(new Set([0, 1]));

    const { result } = renderHook(() => useProgressState());

    expect(result.current).toEqual([
      { isCompleted: true, isActive: false, isVisited: true },
      { isCompleted: true, isActive: false, isVisited: true },
      { isCompleted: false, isActive: true, isVisited: true },
    ]);
  });

  it('should mark active step correctly', () => {
    mockCurrentStepIndex.mockReturnValue(1);
    mockVisitedValidSteps.mockReturnValue(new Set([0]));

    const { result } = renderHook(() => useProgressState());

    expect(result.current).toEqual([
      { isCompleted: true, isActive: false, isVisited: true },
      { isCompleted: false, isActive: true, isVisited: true },
      { isCompleted: false, isActive: false, isVisited: false },
    ]);
  });

  it('should mark visited steps correctly', () => {
    mockCurrentStepIndex.mockReturnValue(1);
    mockVisitedValidSteps.mockReturnValue(new Set([]));

    const { result } = renderHook(() => useProgressState());

    expect(result.current).toEqual([
      { isCompleted: false, isActive: false, isVisited: true },
      { isCompleted: false, isActive: true, isVisited: true },
      { isCompleted: false, isActive: false, isVisited: false },
    ]);
  });

  it('should handle empty steps array', () => {
    mockUseSteps.mockReturnValue([]);
    mockCurrentStepIndex.mockReturnValue(0);
    mockVisitedValidSteps.mockReturnValue(new Set([]));

    const { result } = renderHook(() => useProgressState());

    expect(result.current).toEqual([]);
  });

  it('should handle future completed steps (user completed step ahead)', () => {
    mockCurrentStepIndex.mockReturnValue(0);
    mockVisitedValidSteps.mockReturnValue(new Set([2]));

    const { result } = renderHook(() => useProgressState());

    expect(result.current).toEqual([
      { isCompleted: false, isActive: true, isVisited: true },
      { isCompleted: false, isActive: false, isVisited: false },
      { isCompleted: true, isActive: false, isVisited: false },
    ]);
  });
});

import { renderHook } from '@/test/testHelpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

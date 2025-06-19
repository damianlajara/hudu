import type { WizardSection, WizardStep } from '@/types/wizard';
import { beforeEach, describe, expect, it } from 'vitest';
import { createNavigationStore } from './navigationStore';

const mockSections: WizardSection[] = [
  {
    id: 'section-1',
    title: 'Project Setup',
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
];

const mockSteps: WizardStep[] = [
  {
    id: 'step-1',
    title: 'Basic Info',
    sectionId: 'section-1',
    fields: [],
    isValid: false,
  },
  {
    id: 'step-2',
    title: 'Advanced Settings',
    sectionId: 'section-1',
    fields: [],
    isValid: false,
  },
  {
    id: 'step-3',
    title: 'Configuration',
    sectionId: 'section-2',
    fields: [],
    isValid: false,
  },
  {
    id: 'step-4',
    title: 'Review',
    sectionId: 'section-3',
    fields: [],
    isValid: false,
  },
];

describe('NavigationStore', () => {
  let store: ReturnType<typeof createNavigationStore>;

  beforeEach(() => {
    store = createNavigationStore();
  });

  describe('initial state', () => {
    it('initializes with default values', () => {
      const state = store.getState();
      expect(state.currentStepIndex).toBe(0);
      expect(state.currentSectionId).toBe('section-1');
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.lastCompletedStepIndex).toBe(-1);
      expect(state.visitedValidSteps).toEqual(new Set());
    });
  });

  describe('goNext', () => {
    it('advances to next step when possible', () => {
      store.getState().actions.goNext(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(1);
      expect(state.currentSectionId).toBe('section-1');
      expect(state.visitedValidSteps.has(0)).toBe(true);
    });

    it('does not advance beyond last step', () => {
      store.setState({ currentStepIndex: mockSteps.length - 1 });
      store.getState().actions.goNext(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(mockSteps.length - 1);
    });

    it('updates section when moving to step in different section', () => {
      store.setState({ currentStepIndex: 1 });
      store.getState().actions.goNext(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(2);
      expect(state.currentSectionId).toBe('section-2');
    });

    it('marks previous step as visited', () => {
      store.getState().actions.goNext(mockSteps);
      store.getState().actions.goNext(mockSteps);

      const state = store.getState();
      expect(state.visitedValidSteps.has(0)).toBe(true);
      expect(state.visitedValidSteps.has(1)).toBe(true);
    });
  });

  describe('goBack', () => {
    it('goes back to previous step when possible', () => {
      store.setState({ currentStepIndex: 2, currentSectionId: 'section-2' });
      store.getState().actions.goBack(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(1);
      expect(state.currentSectionId).toBe('section-1');
    });

    it('does not go back beyond first step', () => {
      store.getState().actions.goBack(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(0);
    });

    it('updates section when moving to step in different section', () => {
      store.setState({ currentStepIndex: 2, currentSectionId: 'section-2' });
      store.getState().actions.goBack(mockSteps);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(1);
      expect(state.currentSectionId).toBe('section-1');
    });
  });

  describe('goToStep', () => {
    it('navigates to valid step index', () => {
      // Set up visited steps to make step 2 accessible
      store.setState({ visitedValidSteps: new Set([0, 1, 2]) });

      const result = store.getState().actions.goToStep(2, mockSteps);

      expect(result).toBe(true);
      const state = store.getState();
      expect(state.currentStepIndex).toBe(2);
      expect(state.currentSectionId).toBe('section-2');
    });

    it('rejects invalid step index', () => {
      const result = store.getState().actions.goToStep(-1, mockSteps);
      expect(result).toBe(false);

      const result2 = store
        .getState()
        .actions.goToStep(mockSteps.length, mockSteps);
      expect(result2).toBe(false);
    });

    it('allows navigation to current step', () => {
      const result = store.getState().actions.goToStep(0, mockSteps);
      expect(result).toBe(true);
    });

    it('allows navigation to previous steps', () => {
      store.setState({ currentStepIndex: 2 });
      const result = store.getState().actions.goToStep(1, mockSteps);
      expect(result).toBe(true);
    });

    it('prevents navigation to uncompleted future steps', () => {
      const result = store.getState().actions.goToStep(2, mockSteps);
      expect(result).toBe(false);
    });

    it('allows navigation to completed future steps', () => {
      store.setState({ visitedValidSteps: new Set([0, 1, 2]) });
      const result = store.getState().actions.goToStep(2, mockSteps);
      expect(result).toBe(true);
    });
  });

  describe('goToSection', () => {
    it('navigates to first step of valid section', () => {
      const result = store
        .getState()
        .actions.goToSection('section-2', mockSteps, mockSections);

      expect(result).toBe(false);
      const state = store.getState();
      expect(state.currentStepIndex).toBe(0);
    });

    it('rejects invalid section', () => {
      const result = store
        .getState()
        .actions.goToSection('invalid-section', mockSteps, mockSections);
      expect(result).toBe(false);
    });

    it('navigates to accessible section', () => {
      store.setState({ visitedValidSteps: new Set([0, 1, 2]) });
      const result = store
        .getState()
        .actions.goToSection('section-2', mockSteps, mockSections);

      expect(result).toBe(true);
      const state = store.getState();
      expect(state.currentStepIndex).toBe(2);
      expect(state.currentSectionId).toBe('section-2');
    });
  });

  describe('canNavigateToStep', () => {
    it('allows navigation to current step', () => {
      const result = store.getState().actions.canNavigateToStep(0);
      expect(result).toBe(true);
    });

    it('allows navigation to previous steps', () => {
      store.setState({ currentStepIndex: 2 });
      const result = store.getState().actions.canNavigateToStep(1);
      expect(result).toBe(true);
    });

    it('prevents navigation to future uncompleted steps', () => {
      const result = store.getState().actions.canNavigateToStep(2);
      expect(result).toBe(false);
    });

    it('allows navigation to completed future steps', () => {
      store.setState({ visitedValidSteps: new Set([2]) });
      const result = store.getState().actions.canNavigateToStep(2);
      expect(result).toBe(true);
    });
  });

  describe('setHasUnsavedChanges', () => {
    it('updates unsaved changes flag', () => {
      store.getState().actions.setHasUnsavedChanges(true);

      const state = store.getState();
      expect(state.hasUnsavedChanges).toBe(true);
    });
  });

  describe('setLastCompletedStepIndex', () => {
    it('updates last completed step index', () => {
      store.getState().actions.setLastCompletedStepIndex(2);

      const state = store.getState();
      expect(state.lastCompletedStepIndex).toBe(2);
    });
  });

  describe('restoreNavigationState', () => {
    it('restores navigation state', () => {
      const navigationState = {
        currentStepIndex: 2,
        currentSectionId: 'section-2',
        lastCompletedStepIndex: 1,
      };

      store.getState().actions.restoreNavigationState(navigationState);

      const state = store.getState();
      expect(state.currentStepIndex).toBe(2);
      expect(state.currentSectionId).toBe('section-2');
      expect(state.lastCompletedStepIndex).toBe(1);
    });
  });

  describe('markStepCompleted', () => {
    it('marks step as completed', () => {
      store.getState().actions.markStepCompleted(1);

      const state = store.getState();
      expect(state.visitedValidSteps.has(1)).toBe(true);
    });

    it('preserves existing completed steps', () => {
      store.getState().actions.markStepCompleted(1);
      store.getState().actions.markStepCompleted(2);

      const state = store.getState();
      expect(state.visitedValidSteps.has(1)).toBe(true);
      expect(state.visitedValidSteps.has(2)).toBe(true);
    });
  });

  describe('getLastCompletedStepIndex', () => {
    it('returns -1 when no steps completed', () => {
      const result = store.getState().actions.getLastCompletedStepIndex();
      expect(result).toBe(-1);
    });

    it('returns highest completed step index', () => {
      store.getState().actions.markStepCompleted(1);
      store.getState().actions.markStepCompleted(3);
      store.getState().actions.markStepCompleted(2);

      const result = store.getState().actions.getLastCompletedStepIndex();
      expect(result).toBe(3);
    });
  });

  describe('isStepCompleted', () => {
    it('returns false for uncompleted step', () => {
      const result = store.getState().actions.isStepCompleted(1);
      expect(result).toBe(false);
    });

    it('returns true for completed step', () => {
      store.getState().actions.markStepCompleted(1);
      const result = store.getState().actions.isStepCompleted(1);
      expect(result).toBe(true);
    });
  });

  describe('clearVisitedSteps', () => {
    it('clears all visited steps', () => {
      store.getState().actions.markStepCompleted(1);
      store.getState().actions.markStepCompleted(2);
      store.getState().actions.clearVisitedSteps();

      const state = store.getState();
      expect(state.visitedValidSteps.size).toBe(0);
    });
  });

  describe('selectors', () => {
    it('getCurrentStepIndex returns current step index', () => {
      store.setState({ currentStepIndex: 2 });
      const state = store.getState();
      const result = state.selectors.getCurrentStepIndex(state);
      expect(result).toBe(2);
    });

    it('getCurrentSectionId returns current section id', () => {
      store.setState({ currentSectionId: 'section-2' });
      const state = store.getState();
      const result = state.selectors.getCurrentSectionId(state);
      expect(result).toBe('section-2');
    });

    it('getNavigationState returns navigation state', () => {
      store.setState({
        hasUnsavedChanges: true,
        lastCompletedStepIndex: 2,
      });

      const state = store.getState();
      const result = state.selectors.getNavigationState(state);
      expect(result).toEqual({
        hasUnsavedChanges: true,
        lastCompletedStepIndex: 2,
      });
    });
  });
});

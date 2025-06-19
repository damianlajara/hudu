import type { WizardSection, WizardStep } from '@/types/wizard';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStepsStore } from './stepsStore';

describe('StepsStore', () => {
  let stepsStore: ReturnType<typeof createStepsStore>;

  beforeEach(() => {
    stepsStore = createStepsStore();
  });

  describe('Initial State', () => {
    it('should have initial state with mock data', () => {
      const state = stepsStore.getState();
      expect(state.steps.length).toBeGreaterThan(0);
      expect(state.sections.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Steps Management', () => {
    const testSteps: WizardStep[] = [
      {
        id: 'step-1',
        title: 'Test Step 1',
        sectionId: 'section-1',
        isValid: false,
        fields: [],
      },
      {
        id: 'step-2',
        title: 'Test Step 2',
        sectionId: 'section-1',
        isValid: false,
        fields: [],
      },
    ];

    it('should set steps', () => {
      stepsStore.getState().actions.setSteps(testSteps);
      expect(stepsStore.getState().steps).toEqual(testSteps);
    });

    it('should get step by id', () => {
      stepsStore.getState().actions.setSteps(testSteps);
      const step = stepsStore.getState().actions.getStepById('step-1');
      expect(step).toEqual(testSteps[0]);
    });

    it('should return undefined for non-existent step', () => {
      const step = stepsStore.getState().actions.getStepById('non-existent');
      expect(step).toBeUndefined();
    });
  });

  describe('Sections Management', () => {
    const testSections: WizardSection[] = [
      {
        id: 'section-1',
        title: 'Test Section 1',
        stepIds: ['step-1', 'step-2'],
        isCompleted: false,
        isActive: true,
      },
      {
        id: 'section-2',
        title: 'Test Section 2',
        stepIds: ['step-3'],
        isCompleted: false,
        isActive: false,
      },
    ];

    it('should set sections', () => {
      stepsStore.getState().actions.setSections(testSections);
      expect(stepsStore.getState().sections).toEqual(testSections);
    });

    it('should get section by id', () => {
      stepsStore.getState().actions.setSections(testSections);
      const section = stepsStore.getState().actions.getSectionById('section-1');
      expect(section).toEqual(testSections[0]);
    });

    it('should return undefined for non-existent section', () => {
      const section = stepsStore
        .getState()
        .actions.getSectionById('non-existent');
      expect(section).toBeUndefined();
    });
  });

  describe('Field Selection Management', () => {
    const stepWithOptions: WizardStep = {
      id: 'step-1',
      title: 'Test Step',
      sectionId: 'section-1',
      isValid: false,
      fields: [
        {
          id: 'test-field',
          type: 'multi-select',
          label: 'Test Field',
          isRequired: true,
          options: [
            { id: 'opt1', label: 'Option 1', value: 'opt1', isSelected: false },
            { id: 'opt2', label: 'Option 2', value: 'opt2', isSelected: false },
            { id: 'opt3', label: 'Option 3', value: 'opt3', isSelected: false },
          ],
        },
      ],
    };

    beforeEach(() => {
      stepsStore.getState().actions.setSteps([stepWithOptions]);
    });

    it('should update field selection', () => {
      stepsStore
        .getState()
        .actions.updateFieldSelection('step-1', 'test-field', ['opt1', 'opt3']);

      const step = stepsStore.getState().actions.getStepById('step-1');
      const field = step?.fields[0];

      expect(field?.options[0].isSelected).toBe(true);
      expect(field?.options[1].isSelected).toBe(false);
      expect(field?.options[2].isSelected).toBe(true);
    });

    it('should toggle select all for multi-select field', () => {
      const fieldWithSelectAll = {
        ...stepWithOptions.fields[0],
        allowSelectAll: true,
      };
      const stepWithSelectAll = {
        ...stepWithOptions,
        fields: [fieldWithSelectAll],
      };

      stepsStore.getState().actions.setSteps([stepWithSelectAll]);
      stepsStore.getState().actions.toggleSelectAll('step-1', 'test-field');

      const step = stepsStore.getState().actions.getStepById('step-1');
      const field = step?.fields[0];

      expect(field?.options.every((opt) => opt.isSelected)).toBe(true);
    });

    it('should deselect all when toggling select all on fully selected field', () => {
      const fieldWithSelectAll = {
        ...stepWithOptions.fields[0],
        allowSelectAll: true,
      };
      const stepWithSelectAll = {
        ...stepWithOptions,
        fields: [fieldWithSelectAll],
      };

      stepsStore.getState().actions.setSteps([stepWithSelectAll]);

      stepsStore
        .getState()
        .actions.updateFieldSelection('step-1', 'test-field', [
          'opt1',
          'opt2',
          'opt3',
        ]);

      stepsStore.getState().actions.toggleSelectAll('step-1', 'test-field');
      const step = stepsStore.getState().actions.getStepById('step-1');
      const field = step?.fields[0];
      expect(field?.options.every((opt) => !opt.isSelected)).toBe(true);
    });

    it('should not affect other steps when updating field selection', () => {
      const otherStep: WizardStep = {
        id: 'step-2',
        title: 'Other Step',
        sectionId: 'section-1',
        isValid: false,
        fields: [
          {
            id: 'other-field',
            type: 'single-select',
            label: 'Other Field',
            isRequired: true,
            options: [
              {
                id: 'other1',
                label: 'Other 1',
                value: 'other1',
                isSelected: false,
              },
            ],
          },
        ],
      };

      stepsStore.getState().actions.setSteps([stepWithOptions, otherStep]);
      stepsStore
        .getState()
        .actions.updateFieldSelection('step-1', 'test-field', ['opt1']);

      const unchangedStep = stepsStore.getState().actions.getStepById('step-2');
      expect(unchangedStep).toEqual(otherStep);
    });
  });

  describe('Atomic Selectors', () => {
    const testSteps: WizardStep[] = [
      {
        id: 'step-1',
        title: 'Test Step 1',
        sectionId: 'section-1',
        isValid: true,
        fields: [],
      },
    ];

    const testSections: WizardSection[] = [
      {
        id: 'section-1',
        title: 'Test Section',
        stepIds: ['step-1'],
        isCompleted: false,
        isActive: true,
      },
    ];

    beforeEach(() => {
      stepsStore.getState().actions.setSteps(testSteps);
      stepsStore.getState().actions.setSections(testSections);
    });

    it('should return steps through selectors', () => {
      const state = stepsStore.getState();
      expect(state.selectors.getSteps(state)).toEqual(testSteps);
    });

    it('should return sections through selectors', () => {
      const state = stepsStore.getState();
      expect(state.selectors.getSections(state)).toEqual(testSections);
    });

    it('should return step by id through selectors', () => {
      const state = stepsStore.getState();
      const step = state.selectors.getStepById(state, 'step-1');
      expect(step).toEqual(testSteps[0]);
    });

    it('should return section by id through selectors', () => {
      const state = stepsStore.getState();
      const section = state.selectors.getSectionById(state, 'section-1');
      expect(section).toEqual(testSections[0]);
    });
  });
});

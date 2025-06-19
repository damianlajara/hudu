import type { WizardFormData } from '@/types/wizard';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFormStore } from './formStore';

describe('FormStore', () => {
  let store: ReturnType<typeof createFormStore>;

  beforeEach(() => {
    store = createFormStore();
  });

  describe('initial state', () => {
    it('initializes with empty form data', () => {
      const state = store.getState();
      expect(state.formData).toEqual({});
      expect(state.isDirty).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.savedProgress).toBeNull();
    });
  });

  describe('updateFormData', () => {
    it('updates form data for a step', () => {
      const stepId = 'step-1';
      const data = { field1: 'value1' };

      store.getState().actions.updateFormData(stepId, data);

      const state = store.getState();
      expect(state.formData[stepId]).toEqual(data);
      expect(state.hasUnsavedChanges).toBe(true);
    });

    it('merges new data with existing step data', () => {
      const stepId = 'step-1';
      const initialData = { field1: 'value1' };
      const newData = { field2: 'value2' };

      store.getState().actions.updateFormData(stepId, initialData);
      store.getState().actions.updateFormData(stepId, newData);

      const state = store.getState();
      expect(state.formData[stepId]).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });
  });

  describe('getFormData', () => {
    it('returns undefined for non-existent step', () => {
      const result = store.getState().actions.getFormData('non-existent-step');
      expect(result).toBeUndefined();
    });

    it('returns step data when it exists', () => {
      const stepId = 'step-1';
      const data = { field1: 'value1' };

      store.getState().actions.updateFormData(stepId, data);
      const result = store.getState().actions.getFormData(stepId);

      expect(result).toEqual(data);
    });
  });

  describe('getFieldValue', () => {
    it('returns undefined for non-existent step', () => {
      const result = store
        .getState()
        .actions.getFieldValue('non-existent-step', 'field1');
      expect(result).toBeUndefined();
    });

    it('returns undefined for non-existent field', () => {
      const stepId = 'step-1';
      store.getState().actions.updateFormData(stepId, { field1: 'value1' });

      const result = store.getState().actions.getFieldValue(stepId, 'field2');
      expect(result).toBeUndefined();
    });

    it('returns field value when it exists', () => {
      const stepId = 'step-1';
      const fieldId = 'field1';
      const value = 'test-value';

      store.getState().actions.updateFormData(stepId, { [fieldId]: value });
      const result = store.getState().actions.getFieldValue(stepId, fieldId);

      expect(result).toBe(value);
    });
  });

  describe('setFieldValue', () => {
    it('sets field value in step', () => {
      const stepId = 'step-1';
      const fieldId = 'field1';
      const value = 'test-value';

      store.getState().actions.setFieldValue(stepId, fieldId, value);

      const state = store.getState();
      expect(state.formData[stepId][fieldId]).toBe(value);
    });

    it('preserves existing fields when setting new field', () => {
      const stepId = 'step-1';
      store.getState().actions.updateFormData(stepId, { existing: 'value' });
      store.getState().actions.setFieldValue(stepId, 'new', 'new-value');

      const state = store.getState();
      expect(state.formData[stepId]).toEqual({
        existing: 'value',
        new: 'new-value',
      });
    });
  });

  describe('markStepDirty', () => {
    it('marks step as dirty', () => {
      store.getState().actions.markStepDirty('step-1', true);

      const state = store.getState();
      expect(state.isDirty).toBe(true);
      expect(state.hasUnsavedChanges).toBe(true);
    });

    it('marks step as clean', () => {
      store.getState().actions.markStepDirty('step-1', true);
      store.getState().actions.markStepDirty('step-1', false);

      const state = store.getState();
      expect(state.isDirty).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('resetStepForm', () => {
    it('resets step form to empty object', () => {
      const stepId = 'step-1';
      store.getState().actions.updateFormData(stepId, { field1: 'value1' });
      store.getState().actions.resetStepForm(stepId);

      const state = store.getState();
      expect(state.formData[stepId]).toEqual({});
    });
  });

  describe('resetAllForms', () => {
    it('resets all form data and flags', () => {
      store.getState().actions.updateFormData('step-1', { field1: 'value1' });
      store.getState().actions.updateFormData('step-2', { field2: 'value2' });
      store.getState().actions.markStepDirty('step-1', true);

      store.getState().actions.resetAllForms();

      const state = store.getState();
      expect(state.formData).toEqual({});
      expect(state.isDirty).toBe(false);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('saveProgress', () => {
    it('saves progress with navigation state', () => {
      const formData = { 'step-1': { field1: 'value1' } };
      const navigationState = {
        currentStepIndex: 1,
        currentSectionId: 'section-2',
        lastCompletedStepIndex: 0,
      };

      store.getState().actions.updateFormData('step-1', formData['step-1']);
      store.getState().actions.saveProgress(navigationState);

      const state = store.getState();
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.savedProgress).toMatchObject({
        formData,
        navigationState,
      });
      expect(state.savedProgress?.timestamp).toBeDefined();
    });

    it('saves progress with default navigation state when not provided', () => {
      store.getState().actions.saveProgress();

      const state = store.getState();
      expect(state.savedProgress?.navigationState).toEqual({
        currentStepIndex: 0,
        currentSectionId: 'section-1',
        lastCompletedStepIndex: -1,
      });
    });
  });

  describe('restoreProgress', () => {
    it('restores form data', () => {
      const data: WizardFormData = {
        'step-1': { field1: 'value1' },
        'step-2': { field2: 'value2' },
      };

      store.getState().actions.restoreProgress(data);

      const state = store.getState();
      expect(state.formData).toEqual(data);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('getSavedProgress', () => {
    it('returns null when no progress saved', () => {
      const result = store.getState().actions.getSavedProgress();
      expect(result).toBeNull();
    });

    it('returns saved progress when available', () => {
      const navigationState = {
        currentStepIndex: 1,
        currentSectionId: 'section-2',
        lastCompletedStepIndex: 0,
      };

      store.getState().actions.saveProgress(navigationState);
      const result = store.getState().actions.getSavedProgress();

      expect(result).toMatchObject({
        formData: {},
        navigationState,
      });
    });
  });

  describe('restoreFromSaved', () => {
    it('returns null when no saved progress', () => {
      const result = store.getState().actions.restoreFromSaved();
      expect(result).toBeNull();
    });

    it('restores from saved progress', () => {
      const formData = { 'step-1': { field1: 'value1' } };
      const navigationState = {
        currentStepIndex: 1,
        currentSectionId: 'section-2',
        lastCompletedStepIndex: 0,
      };

      store.getState().actions.updateFormData('step-1', formData['step-1']);
      store.getState().actions.saveProgress(navigationState);
      store.getState().actions.resetAllForms();

      const result = store.getState().actions.restoreFromSaved();

      expect(result).toEqual(navigationState);
      const state = store.getState();
      expect(state.formData).toEqual(formData);
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('selectors', () => {
    it('getFormData returns form data', () => {
      const data = { 'step-1': { field1: 'value1' } };
      store.getState().actions.updateFormData('step-1', data['step-1']);

      const state = store.getState();
      const result = state.selectors.getFormData(state);
      expect(result).toEqual(data);
    });

    it('getIsDirty returns dirty state', () => {
      store.getState().actions.markStepDirty('step-1', true);

      const state = store.getState();
      const result = state.selectors.getIsDirty(state);
      expect(result).toBe(true);
    });

    it('getHasUnsavedChanges returns unsaved changes state', () => {
      store.getState().actions.updateFormData('step-1', { field1: 'value1' });

      const state = store.getState();
      const result = state.selectors.getHasUnsavedChanges(state);
      expect(result).toBe(true);
    });
  });
});

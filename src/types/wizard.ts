export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  sectionId: string;
  fields: FormField[];
  isValid: boolean;
}

export interface WizardSection {
  id: string;
  title: string;
  description?: string;
  stepIds: string[];
  isCompleted: boolean;
  isActive: boolean;
}

export interface FormField {
  id: string;
  type: 'single-select' | 'multi-select';
  label: string;
  options: SelectOption[];
  isRequired: boolean;
  allowSelectAll?: boolean;
  minSelections?: number;
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  isSelected: boolean;
  icon?: string;
}

export type FieldValue = string | string[];

export type StepFormData = Record<string, FieldValue>;

export type WizardFormData = Record<string, StepFormData>;

export type SingleSelectValue = string;
export type MultiSelectValue = string[];

export type FormFieldValue<T extends FormField['type']> =
  T extends 'single-select' ? SingleSelectValue : MultiSelectValue;

export type TypedStepData<
  T extends Record<string, FormField['type']> = Record<
    string,
    FormField['type']
  >,
> = {
  [K in keyof T]: FormFieldValue<T[K]>;
};

export interface WizardState {
  currentStepIndex: number;
  currentSectionId: string;
  sections: WizardSection[];
  steps: WizardStep[];
  formData: WizardFormData;
  isLoading: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
}

export interface NavigationState {
  hasUnsavedChanges: boolean;
  lastCompletedStepIndex: number;
}

export type StepId = string;
export type FieldId = string;
export type SectionId = string;

import { z } from 'zod';

export const singleSelectSchema = z.string().min(1, 'Please select an option');

export const multiSelectSchema = (minSelections: number = 1) =>
  z
    .array(z.string())
    .min(
      minSelections,
      `Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`
    );

export const step1Schema = z.object({
  'project-type': singleSelectSchema,
});

export const step2Schema = z.object({
  technologies: multiSelectSchema(1),
});

export const step3Schema = z.object({
  features: multiSelectSchema(2),
});

// creates a dynamic schema based on the step so that we cab have strict validation on eacg step
export const createStepSchema = (step: WizardStep) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  step.fields.forEach((field) => {
    if (!field.isRequired) {
      if (field.type === 'single-select') {
        schemaFields[field.id] = z.string().optional();
      } else {
        schemaFields[field.id] = z.array(z.string()).optional();
      }
    } else {
      if (field.type === 'single-select') {
        schemaFields[field.id] = singleSelectSchema;
      } else {
        const minSelections = field.minSelections || 1;
        schemaFields[field.id] = multiSelectSchema(minSelections);
      }
    }
  });

  return z.object(schemaFields);
};

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;

export type StepFormDataFromSchema<T extends z.ZodSchema> = z.infer<T>;

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

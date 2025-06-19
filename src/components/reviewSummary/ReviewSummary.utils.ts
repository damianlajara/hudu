import type { WizardFormData, WizardStep } from '@/types/wizard';

export interface ReviewSummaryData {
  criteriaType: string | null;
  recordTypes: string[] | null;
  triggers: string[] | null;
  actions: string[] | null;
  hasData: boolean;
}

export function stripCriteriaPrefix(
  data: string[] | null,
  criteriaType: string | null
) {
  if (!data || !Array.isArray(data) || !criteriaType) {
    return data;
  }
  const prefixRegex = new RegExp(`^${criteriaType}\\s*`, 'gi');
  return data.map((d: string) => d.replace(prefixRegex, ''));
}

export function formatArrayForDisplay(
  items: string[] | string | null,
  connector: 'and' | 'or' = 'and'
): string | null {
  if (!items || (Array.isArray(items) && items.length === 0)) {
    return null;
  }

  if (typeof items === 'string') return items;

  if (Array.isArray(items)) {
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(` ${connector} `);

    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];
    return `${allButLast.join(', ')} ${connector} ${last}`;
  }

  return null;
}

function mapValuesToLabels(
  values: string[] | string | null,
  steps: WizardStep[],
  stepId: string,
  fieldId: string
): string[] | string | null {
  if (!values) return null;

  const step = steps.find((s) => s.id === stepId);
  const field = step?.fields.find((f) => f.id === fieldId);

  if (!field?.options) return values;

  const valueArray = Array.isArray(values) ? values : [values];
  const labels = valueArray.map((value) => {
    const option = field.options.find((opt) => opt.value === value);
    return option?.label || value;
  });

  return Array.isArray(values) ? labels : labels[0];
}

export function extractReviewSummaryData(
  formData: WizardFormData,
  steps: WizardStep[]
): ReviewSummaryData {
  const criteriaType =
    (formData['step-1']?.['criteria-type'] as string) || null;
  const recordTypesValues =
    (formData['step-2']?.['recordTypes'] as string[]) || null;
  const rawTriggersValues =
    (formData['step-3']?.['triggers'] as string[]) || null;
  const actionsValues = (formData['step-4']?.['actions'] as string[]) || null;

  // Get the labels we hardcoded in our mockdata instead of values so that the text can be more readable
  const criteriaTypeLabel = mapValuesToLabels(
    criteriaType,
    steps,
    'step-1',
    'criteria-type'
  ) as string;
  const recordTypes = mapValuesToLabels(
    recordTypesValues,
    steps,
    'step-2',
    'recordTypes'
  ) as string[];
  const rawTriggers = mapValuesToLabels(
    rawTriggersValues,
    steps,
    'step-3',
    'triggers'
  ) as string[];
  const actions = mapValuesToLabels(
    actionsValues,
    steps,
    'step-4',
    'actions'
  ) as string[];

  const triggers = stripCriteriaPrefix(rawTriggers, criteriaTypeLabel);
  const hasData = Boolean(
    criteriaTypeLabel || recordTypes || triggers || actions
  );

  return {
    criteriaType: criteriaTypeLabel,
    recordTypes,
    triggers,
    actions,
    hasData,
  };
}

export function generateSummaryText(data: ReviewSummaryData) {
  const criteriaText = data.criteriaType;
  const triggersText = formatArrayForDisplay(data.triggers, 'or');
  const actionsText = formatArrayForDisplay(data.actions, 'and');

  return {
    criteriaText,
    triggersText,
    actionsText,
  };
}

import type { WizardFormData } from '@/types/wizard';

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

export function extractReviewSummaryData(
  formData: WizardFormData
): ReviewSummaryData {
  const criteriaType =
    (formData['step-1']?.['criteria-type'] as string) || null;
  const recordTypes = (formData['step-2']?.['recordTypes'] as string[]) || null;
  const rawTriggers = (formData['step-3']?.['triggers'] as string[]) || null;
  const actions = (formData['step-4']?.['actions'] as string[]) || null;

  const triggers = stripCriteriaPrefix(rawTriggers, criteriaType);
  const hasData = Boolean(criteriaType || recordTypes || triggers || actions);

  return {
    criteriaType,
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

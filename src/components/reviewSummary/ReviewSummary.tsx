import { useFormData } from '@/store/formStore/formStore';
import { useSteps } from '@/store/stepsStore/stepsStore';
import {
  extractReviewSummaryData,
  generateSummaryText,
} from './ReviewSummary.utils';

export default function ReviewSummary() {
  const formData = useFormData();
  const steps = useSteps();

  const summaryData = extractReviewSummaryData(formData, steps);
  const { criteriaText, triggersText, actionsText } =
    generateSummaryText(summaryData);

  if (!summaryData.hasData) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          Complete the previous steps to see your workflow summary here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-neutral-light-2 border-stroke-neutral-1 space-y-1.5 rounded-sm border p-1.5">
      <div>
        <p className="text-sm">
          When any of the following{' '}
          <span>
            {criteriaText?.toLowerCase() || '[criteria not selected]'}
          </span>{' '}
          types is{' '}
          <span>{triggersText?.toLowerCase() || '[trigger not selected]'}</span>
          , <span>{actionsText?.toLowerCase() || '[action not selected]'}</span>
          .
        </p>
      </div>

      {summaryData.recordTypes && summaryData.recordTypes.length > 0 && (
        <div>
          <ul className="list-inside list-disc space-y-1 pl-2 text-sm">
            {summaryData.recordTypes.map((recordType, index) => (
              <li key={index}>{recordType}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

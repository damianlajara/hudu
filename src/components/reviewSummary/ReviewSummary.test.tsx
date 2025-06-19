import ReviewSummary from '@/components/reviewSummary/ReviewSummary';
import { useFormData } from '@/store/formStore/formStore';
import { defaultMockFormData } from '@/test/mockUtils';
import { render, screen } from '@/test/testHelpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/store/formStore/formStore');

describe('ReviewSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFormData).mockReturnValue(defaultMockFormData);
  });
  it('renders review summary content with form data', () => {
    render(<ReviewSummary />);

    expect(screen.getByText(/when any of the following/i)).toBeInTheDocument();
  });

  it('handles all data present', () => {
    const completeData = {
      'step-1': { 'criteria-type': 'user' },
      'step-2': { recordTypes: ['Password', 'Process', 'Asset'] },
      'step-3': {
        triggers: ['User Created', 'User Updated', 'User Deleted'],
      },
      'step-4': { actions: ['Flag Record', 'Send Email', 'Call Webhook'] },
    };

    vi.mocked(useFormData).mockReturnValue(completeData);

    render(<ReviewSummary />);
    expect(screen.getByText(/when any of the following/i)).toBeInTheDocument();
    expect(screen.getByText(/created.*updated.*deleted/i)).toBeInTheDocument();
    expect(screen.getByText(/flag.*email.*webhook/i)).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
  });

  it('formats multiple items with proper connectors', () => {
    const multiItemData = {
      ...defaultMockFormData,
      'step-3': { triggers: ['Record Created', 'Record Updated'] },
      'step-4': { actions: ['Flag Record', 'Send Email'] },
    };

    vi.mocked(useFormData).mockReturnValue(multiItemData);

    render(<ReviewSummary />);

    expect(screen.getByText(/created or updated/i)).toBeInTheDocument();
    expect(screen.getByText(/flag record and send email/i)).toBeInTheDocument();
  });
});

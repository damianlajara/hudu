import FormField from '@/components/formField/FormField';
import Button from '@/components/ui/Button';
import { render, screen, userEvent } from '@/test/testHelpers';
import type { FormField as FormFieldType } from '@/types/wizard';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

const TestWrapper = ({
  children,
  defaultValues = {},
}: {
  children: ReactNode;
  defaultValues?: Record<string, unknown>;
}) => {
  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        {children}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
};

describe('FormField', () => {
  const user = userEvent.setup();

  describe('Single Select Field', () => {
    const singleSelectField: FormFieldType = {
      id: 'project-type',
      type: 'single-select',
      label: 'Select your project type',
      isRequired: true,
      options: [
        {
          id: 'web',
          label: 'Web Application',
          value: 'web',
          isSelected: false,
        },
        {
          id: 'mobile',
          label: 'Mobile Application',
          value: 'mobile',
          isSelected: false,
        },
        {
          id: 'desktop',
          label: 'Desktop Application',
          value: 'desktop',
          isSelected: false,
        },
      ],
    };

    it('renders all options as buttons', () => {
      render(
        <TestWrapper>
          <FormField field={singleSelectField} />
        </TestWrapper>
      );

      expect(screen.getByText('Web Application')).toBeInTheDocument();
      expect(screen.getByText('Mobile Application')).toBeInTheDocument();
      expect(screen.getByText('Desktop Application')).toBeInTheDocument();
    });

    it('selects option on click', async () => {
      render(
        <TestWrapper>
          <FormField field={singleSelectField} />
        </TestWrapper>
      );

      const webOption = screen.getByText('Web Application');
      await user.click(webOption);

      expect(webOption).toHaveAttribute('aria-pressed', 'true');
    });

    it('deselects previous option when selecting new one', async () => {
      render(
        <TestWrapper>
          <FormField field={singleSelectField} />
        </TestWrapper>
      );

      const webOption = screen.getByText('Web Application');
      const mobileOption = screen.getByText('Mobile Application');

      await user.click(webOption);
      expect(webOption).toHaveAttribute('aria-pressed', 'true');

      await user.click(mobileOption);
      expect(webOption).toHaveAttribute('aria-pressed', 'false');
      expect(mobileOption).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Multi Select Field', () => {
    const multiSelectField: FormFieldType = {
      id: 'features',
      type: 'multi-select',
      label: 'Select required features',
      isRequired: true,
      allowSelectAll: true,
      minSelections: 1,
      options: [
        {
          id: 'auth',
          label: 'Authentication',
          value: 'auth',
          isSelected: false,
        },
        {
          id: 'database',
          label: 'Database',
          value: 'database',
          isSelected: false,
        },
        {
          id: 'api',
          label: 'API',
          value: 'api',
          isSelected: false,
        },
      ],
    };

    it('allows multiple selections', async () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectField} />
        </TestWrapper>
      );

      const authOption = screen.getByText('Authentication');
      const databaseOption = screen.getByText('Database');

      await user.click(authOption);
      await user.click(databaseOption);

      expect(authOption).toHaveAttribute('aria-pressed', 'true');
      expect(databaseOption).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows select all checkbox when allowSelectAll is true', () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectField} />
        </TestWrapper>
      );

      expect(screen.getByText('Select all')).toBeInTheDocument();
    });

    it('selects all options when select all is clicked', async () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectField} />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');
      await user.click(selectAllCheckbox);

      expect(screen.getByText('Authentication')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByText('Database')).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByText('API')).toHaveAttribute('aria-pressed', 'true');
    });

    it('deselects all options when all are selected and select all is clicked', async () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectField} />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');

      await user.click(selectAllCheckbox);
      expect(screen.getByText('Deselect all')).toBeInTheDocument();

      const deselectAllCheckbox = screen.getByLabelText('Deselect all');
      await user.click(deselectAllCheckbox);
      expect(screen.getByText('Authentication')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByText('Database')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByText('API')).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles individual options correctly', async () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectField} />
        </TestWrapper>
      );

      const authOption = screen.getByText('Authentication');

      await user.click(authOption);
      expect(authOption).toHaveAttribute('aria-pressed', 'true');

      await user.click(authOption);
      expect(authOption).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Multi Select Field without Select All', () => {
    const multiSelectFieldNoSelectAll: FormFieldType = {
      id: 'triggers',
      type: 'multi-select',
      label: 'Select triggers',
      isRequired: true,
      allowSelectAll: false,
      minSelections: 1,
      options: [
        {
          id: 'created',
          label: 'Record Created',
          value: 'created',
          isSelected: false,
        },
        {
          id: 'updated',
          label: 'Record Updated',
          value: 'updated',
          isSelected: false,
        },
      ],
    };

    it('does not show select all checkbox when allowSelectAll is false', () => {
      render(
        <TestWrapper>
          <FormField field={multiSelectFieldNoSelectAll} />
        </TestWrapper>
      );

      expect(screen.queryByText('Select all')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Select all')).not.toBeInTheDocument();
    });
  });
});

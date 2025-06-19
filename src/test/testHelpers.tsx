import { Dialog } from '@headlessui/react';
import { render, type RenderOptions } from '@testing-library/react';
import { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

// wraps RHF provider
interface FormWrapperProps {
  children: ReactNode;
  formData?: Record<string, unknown>;
}

export function FormWrapper({ children, formData = {} }: FormWrapperProps) {
  const methods = useForm({
    defaultValues: formData,
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

// wraps dialog provider
interface DialogWrapperProps {
  children: ReactNode;
  open?: boolean;
}

export function DialogWrapper({ children, open = true }: DialogWrapperProps) {
  return (
    <Dialog open={open} onClose={() => null}>
      {children}
    </Dialog>
  );
}

// wraps all providers
interface CombinedWrapperProps {
  children: ReactNode;
  formData?: Record<string, unknown>;
  dialogOpen?: boolean;
}

export function CombinedWrapper({
  children,
  formData = {},
  dialogOpen = true,
}: CombinedWrapperProps) {
  return (
    <DialogWrapper open={dialogOpen}>
      <FormWrapper formData={formData}>{children}</FormWrapper>
    </DialogWrapper>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  formData?: Record<string, unknown>;
  withDialog?: boolean;
  dialogOpen?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    formData,
    withDialog = false,
    dialogOpen = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  let Wrapper: ComponentType<{ children: ReactNode }>;

  if (withDialog) {
    Wrapper = function CombinedWrapperWithProps({
      children,
    }: {
      children: ReactNode;
    }) {
      return (
        <CombinedWrapper formData={formData} dialogOpen={dialogOpen}>
          {children}
        </CombinedWrapper>
      );
    };
  } else if (formData !== undefined) {
    Wrapper = function FormWrapperWithProps({
      children,
    }: {
      children: ReactNode;
    }) {
      return <FormWrapper formData={formData}>{children}</FormWrapper>;
    };
  } else {
    Wrapper = function WrapperWithProps({ children }: { children: ReactNode }) {
      return <>{children}</>;
    };
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything from testing-library/react to make this file our single source of truth
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { renderWithProviders as render }; // Override default render

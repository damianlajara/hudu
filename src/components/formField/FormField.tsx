import Button from '@/components/ui/Button';
import { type FormField as FormFieldType } from '@/types/wizard';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';

interface FormFieldProps {
  field: FormFieldType;
}

export default function FormField({ field }: FormFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({
    name: field.id,
    control,
    defaultValue: field.type === 'single-select' ? '' : [],
  });

  const currentValue = watch(field.id);

  useEffect(() => {
    if (!currentValue) {
      setValue(field.id, field.type === 'single-select' ? '' : []);
    }
  }, [field.id, field.type, setValue, currentValue]);

  const handleOptionToggle = (optionValue: string) => {
    if (field.type === 'single-select') {
      onChange(optionValue);
    } else {
      const currentSelections = Array.isArray(value) ? value : [];
      const newSelections = currentSelections.includes(optionValue)
        ? currentSelections.filter((val) => val !== optionValue)
        : [...currentSelections, optionValue];

      onChange(newSelections);
    }
  };

  const handleSelectAll = () => {
    if (field.type === 'multi-select' && field.allowSelectAll) {
      const currentSelections = Array.isArray(value) ? value : [];
      const allValues = field.options?.map((opt) => opt.value) || [];

      const allSelected = allValues.every((val) =>
        currentSelections.includes(val)
      );
      onChange(allSelected ? [] : allValues);
    }
  };

  const getSelectedOptions = () => {
    if (field.type === 'single-select') {
      return value ? [value] : [];
    }
    return Array.isArray(value) ? value : [];
  };

  const selectedValues = getSelectedOptions();
  const allSelected =
    (field.options?.length || 0) > 0 &&
    field.options?.every((opt) => selectedValues.includes(opt.value));

  return (
    <div className="space-y-4">
      <Field>
        <Label
          id={`${field.id}-label`}
          className="text-text-neutral-light-1 text-sm font-medium"
        >
          {field.label}
        </Label>
      </Field>
      <div role="group" aria-labelledby={`${field.id}-label`}>
        <div className="space-y-2">
          {field.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isRadio = field.type === 'single-select';

            return (
              <Button
                full
                variant="outline"
                key={option.id}
                leadingIcon={
                  option?.icon && (
                    <FontAwesomeIcon
                      className={`h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                      icon={['fas', option.icon] as IconProp}
                    />
                  )
                }
                onClick={() => handleOptionToggle(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOptionToggle(option.value);
                  }
                }}
                className={`text-text-neutral-light-1 justify-stretch p-2 text-left font-bold ${
                  isSelected
                    ? 'border-accent bg-accent-selected hover:bg-accent-selected/75 border-2'
                    : 'hover:bg-gray-50'
                }`}
                aria-pressed={isSelected}
                role={isRadio ? 'radio' : 'checkbox'}
              >
                {option.label}
              </Button>
            );
          }) || []}
        </div>
      </div>
      {field.type === 'multi-select' &&
        field.allowSelectAll &&
        field.options?.length > 1 && (
          <Field className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onChange={handleSelectAll}
              className="group border-stroke-neutral-1 bg-bg-neutral-light-1 data-checked:bg-accent data-checked:border-accent block size-5 cursor-pointer rounded border transition-colors duration-200"
            >
              <CheckIcon className="hidden size-4 fill-white group-data-checked:block" />
            </Checkbox>
            <Label className="text-text-neutral-light-1">
              {allSelected ? 'Deselect all' : 'Select all'}
            </Label>
          </Field>
        )}
    </div>
  );
}

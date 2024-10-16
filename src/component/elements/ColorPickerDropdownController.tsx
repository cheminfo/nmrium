import type { ControllerProps, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { ColorPickerDropdown } from 'react-science/ui';

export function ColorPickerDropdownController<
  TFieldValues extends FieldValues = FieldValues,
>(props: Omit<ControllerProps<TFieldValues>, 'render'>) {
  return (
    <Controller
      {...props}
      render={({ field }) => {
        return (
          <ColorPickerDropdown
            onChangeComplete={({ hex }) => field.onChange(hex)}
            color={{ hex: field.value }}
          />
        );
      }}
    />
  );
}

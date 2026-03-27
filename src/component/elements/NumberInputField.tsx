import type { FieldValues } from 'react-hook-form';

import type { LabelProps } from './Label.tsx';
import Label from './Label.tsx';
import type { NumberInput2ControllerProps } from './NumberInput2Controller.tsx';
import { NumberInput2Controller } from './NumberInput2Controller.tsx';

interface NumberInputFieldProps<
  T extends FieldValues,
> extends NumberInput2ControllerProps<T> {
  labelProps: Omit<LabelProps, 'children'>;
}

export function NumberInputField<T extends FieldValues>(
  props: NumberInputFieldProps<T>,
) {
  const { labelProps, ...inputProps } = props;
  return (
    <Label {...labelProps}>
      <NumberInput2Controller {...inputProps} />
    </Label>
  );
}

import type { LabelProps } from './Label.tsx';
import Label from './Label.tsx';
import type { NumberInput2ControllerProps } from './NumberInput2Controller.tsx';
import { NumberInput2Controller } from './NumberInput2Controller.tsx';

interface NumberInputFieldProps extends NumberInput2ControllerProps {
  labelProps: Omit<LabelProps, 'children'>;
}

export function NumberInputField(props: NumberInputFieldProps) {
  const { labelProps, ...inputProps } = props;
  return (
    <Label {...labelProps}>
      <NumberInput2Controller {...inputProps} />
    </Label>
  );
}

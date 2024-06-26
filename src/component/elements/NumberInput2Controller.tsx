import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { NumberInput2, NumberInput2Props } from './NumberInput2';

interface NumberInput2ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<ControllerProps<TFieldValues>, 'render'> {
  inputProps?: NumberInput2Props;
}

export function NumberInput2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: NumberInput2ControllerProps<TFieldValues>) {
  const {
    inputProps: { onValueChange, ...otherInputProps } = {},
    ...controllerProps
  } = props;

  return (
    <Controller
      {...controllerProps}
      render={({ field }) => {
        return (
          <NumberInput2
            {...field}
            onValueChange={(valueAsNumber, valueAsString, event) => {
              field.onChange(valueAsString);
              onValueChange?.(valueAsNumber, valueAsString, event);
            }}
            {...otherInputProps}
          />
        );
      }}
    />
  );
}

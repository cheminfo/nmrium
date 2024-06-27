import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { NumberInput2, NumberInput2Props } from './NumberInput2';

interface NumberInput2ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<NumberInput2Props, 'name'>,
    Pick<ControllerProps<TFieldValues>, 'control' | 'name'> {
  controllerProps?: Omit<ControllerProps<TFieldValues>, 'render'>;
  noShadowBox?: boolean;
}

export function NumberInput2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: NumberInput2ControllerProps<TFieldValues>) {
  const {
    controllerProps,
    onValueChange,
    name,
    control,
    intent = 'none',
    noShadowBox = false,
    style,
    ...otherInputProps
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field, fieldState: { invalid } }) => {
        return (
          <NumberInput2
            {...field}
            onValueChange={(valueAsNumber, valueAsString, event) => {
              field.onChange(valueAsString);
              onValueChange?.(valueAsNumber, valueAsString, event);
            }}
            {...otherInputProps}
            style={{
              ...style,
              ...(noShadowBox && !invalid && { boxShadow: 'none' }),
            }}
            intent={invalid ? 'danger' : intent}
          />
        );
      }}
    />
  );
}

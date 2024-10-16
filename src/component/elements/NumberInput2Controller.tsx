import { Controller, ControllerProps, FieldValues } from 'react-hook-form';

import { NumberInput2, NumberInput2Props } from './NumberInput2.js';

interface NumberInput2ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<NumberInput2Props, 'name'>,
    Pick<ControllerProps<TFieldValues>, 'control' | 'name'> {
  controllerProps?: Omit<
    ControllerProps<TFieldValues>,
    'control' | 'name' | 'render'
  >;
  noShadowBox?: boolean;
  transformValue?: (value: number) => number;
}

const numberPattern = /^-?\d+(\.\d+)?$/;

export function NumberInput2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: NumberInput2ControllerProps<TFieldValues>) {
  const {
    controllerProps = {},
    onValueChange,
    name,
    control,
    intent = 'none',
    noShadowBox = false,
    style,
    transformValue,
    ...otherInputProps
  } = props;

  const { rules, ...otherControllerProps } = controllerProps;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ pattern: numberPattern, ...rules }}
      {...otherControllerProps}
      render={({ field, fieldState: { invalid } }) => {
        const { onChange, ...otherFieldProps } = field;
        return (
          <NumberInput2
            {...otherFieldProps}
            onValueChange={(valueAsNumber, valueAsString, event) => {
              if (numberPattern.test(valueAsString)) {
                onChange(
                  typeof transformValue === 'function'
                    ? transformValue(valueAsNumber)
                    : valueAsNumber,
                );
              } else {
                onChange(valueAsString);
              }
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

import { useState } from 'react';
import type { ControllerProps, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { NumberInput2Props } from './NumberInput2.js';
import { NumberInput2 } from './NumberInput2.js';

export interface NumberInput2ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
>
  extends
    Omit<NumberInput2Props, 'name'>,
    Pick<ControllerProps<TFieldValues>, 'control' | 'name'> {
  controllerProps?: Omit<
    ControllerProps<TFieldValues>,
    'control' | 'name' | 'render'
  >;
  noShadowBox?: boolean;
  transformValue?: (value: number) => number;
  formatOnBlur?: (value: number) => string;
}

const numberPattern = /^-?\d+(\.\d+)?$/;

export function NumberInput2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: NumberInput2ControllerProps<TFieldValues>) {
  const {
    controllerProps = {},
    onValueChange,
    onButtonClick,
    name,
    control,
    intent = 'none',
    noShadowBox = false,
    style,
    transformValue,
    onFocus,
    formatOnBlur,
    ...otherInputProps
  } = props;
  const [focused, setFocused] = useState(false);

  const { rules, ...otherControllerProps } = controllerProps;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ pattern: numberPattern, ...rules }}
      {...otherControllerProps}
      render={({ field, fieldState: { invalid } }) => {
        const { onChange, onBlur, value, ...otherFieldProps } = field;
        const showOverlay = !focused && typeof formatOnBlur === 'function';
        function handleValueChange(
          valueAsNumber: number,
          valueAsString: string,
          event: HTMLInputElement | null,
        ) {
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
        }

        return (
          <NumberInput2
            onFocus={(e) => {
              onFocus?.(e);
              setFocused(true);
            }}

            {...otherFieldProps}
            onBlur={() => {
              onBlur?.();
              setFocused(false);
            }}
            value={showOverlay ? formatOnBlur(value) : value}
            onValueChange={(valueAsNumber, valueAsString, event) => {
              if (!focused) return;
              handleValueChange(valueAsNumber, valueAsString, event);
            }}
            onButtonClick={(valueAsNumber, valueAsString) => {
              if (!focused) {
                handleValueChange(valueAsNumber, valueAsString, null);
              }
              onButtonClick?.(valueAsNumber, valueAsString);
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

/** @jsxImportSource @emotion/react */

import { FormGroup } from '@blueprintjs/core';
import { css } from '@emotion/react';
import type { ControllerProps, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { Input2Props } from './Input2.js';
import { Input2 } from './Input2.js';

export interface InputMapValueFunctions {
  mapOnChangeValue?: (value: string) => any;
  mapValue?: (value: any) => string;
}

interface Input2ControllerProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<Input2Props, 'name'>,
    Pick<ControllerProps<TFieldValues>, 'control' | 'name'>,
    InputMapValueFunctions {
  controllerProps?: Omit<
    ControllerProps<TFieldValues>,
    'control' | 'name' | 'render'
  >;
  noShadowBox?: boolean;
  enableErrorMessage?: boolean;
}

export function Input2Controller<
  TFieldValues extends FieldValues = FieldValues,
>(props: Input2ControllerProps<TFieldValues>) {
  const {
    controllerProps,
    onChange,
    name,
    control,
    intent = 'none',
    mapOnChangeValue,
    mapValue,
    noShadowBox = false,
    enableErrorMessage = false,
    style,
    fill,
    ...otherInputProps
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      {...controllerProps}
      render={({ field, fieldState: { invalid, error } }) => {
        const { value: originValue, ...otherFieldProps } = field;
        let value: string = originValue;
        if (typeof mapValue === 'function') {
          value = mapValue(originValue);
        }
        const inputComponent = (
          <Input2
            value={value}
            {...otherFieldProps}
            onChange={(value, event) => {
              if (typeof mapOnChangeValue === 'function') {
                field.onChange(mapOnChangeValue(value));
              } else {
                field.onChange(value);
              }
              onChange?.(value, event);
            }}
            style={{
              ...style,
              ...(noShadowBox && !invalid && { boxShadow: 'none' }),
            }}
            intent={invalid ? 'danger' : intent}
            fill={fill}
            {...otherInputProps}
          />
        );

        if (enableErrorMessage && error?.message) {
          return (
            <FormGroup
              fill={fill}
              {...(fill && {
                css: css`
                  div {
                    flex: 1;
                  }
                `,
              })}
              helperText={error.message}
              intent={invalid ? 'danger' : intent}
            >
              {inputComponent}
            </FormGroup>
          );
        }

        return inputComponent;
      }}
    />
  );
}

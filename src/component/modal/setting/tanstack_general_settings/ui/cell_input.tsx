import { Classes, NumericInput } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ComponentProps } from 'react';

import type { Input2Props } from '../../../../elements/Input2.tsx';
import { Input2 } from '../../../../elements/Input2.tsx';

export const CellInputStyled = styled(Input2)`
  input {
    background-color: transparent;
    box-shadow: none;
    outline: none;
  }

  input.${Classes.INPUT}:focus {
    box-shadow: none;
    outline: none;
  }
`;

interface CellInputProps<FilterItem extends string = string> extends Pick<
  Input2Props<FilterItem>,
  'filterItems' | 'autoFocus' | 'onBlur'
> {
  field: {
    name: string;
    state: { value: string; meta: { isValid: boolean; isDirty: boolean } };
    handleChange: (value: string) => void;
    handleBlur: () => void;
  };
}

export function CellInput<FilterItem extends string = string>(
  props: CellInputProps<FilterItem>,
) {
  const { filterItems, autoFocus, onBlur, field } = props;
  const hasIssue = !field.state.meta.isValid && field.state.meta.isDirty;

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    field.handleBlur();
    onBlur?.(e);
  }

  return (
    <CellInputStyled
      name={field.name}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={handleBlur}
      autoFocus={autoFocus}
      intent={hasIssue ? 'danger' : 'none'}
      filterItems={filterItems}
    />
  );
}

export const CellNumericInputStyled = styled(NumericInput)`
  margin-top: 1px;
  margin-right: 1px;

  input {
    background-color: transparent;
    box-shadow: none;
    outline: none;
  }

  input.${Classes.INPUT}:focus {
    box-shadow: none;
    outline: none;
  }

  &.${Classes.CONTROL_GROUP} .${Classes.BUTTON_GROUP}.${Classes.VERTICAL} {
    border-left: 1px dotted lightgray;

    > .${Classes.BUTTON} {
      margin: 0 !important;
      border-radius: 0;
      background: transparent;
      box-shadow: none;

      :first-of-type {
        border-bottom: 1px dotted lightgray;
      }
    }
  }
`;

interface CellNumericInputProps extends Pick<
  ComponentProps<typeof NumericInput>,
  'min' | 'max'
> {
  step?: number;
  field: {
    name: string;
    state: {
      value: string | undefined;
      meta: { isValid: boolean; isDirty: boolean };
    };
    handleChange: (value: string) => void;
    handleBlur: () => void;
  };
}

export function CellNumericInput(props: CellNumericInputProps) {
  const { step, min, max, field } = props;

  const hasIssue = !field.state.meta.isValid && field.state.meta.isDirty;

  function onChange(valueNumber: number, valueString: string) {
    field.handleChange(valueString);
  }

  return (
    <CellNumericInputStyled
      name={field.name}
      step={step}
      stepSize={step}
      min={min}
      max={max}
      value={field.state.value ?? ''}
      onValueChange={onChange}
      onBlur={field.handleBlur}
      intent={hasIssue ? 'danger' : 'none'}
      fill
    />
  );
}

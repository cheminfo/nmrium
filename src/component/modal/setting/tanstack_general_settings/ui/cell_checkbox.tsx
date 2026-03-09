import { Checkbox, Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';

export const CellCheckboxStyled = styled(Checkbox)`
  display: flex;
  align-items: center;
  justify-content: center;

  &.${Classes.CONTROL} {
    padding: 0;
    margin: 0;

    .${Classes.CONTROL_INDICATOR} {
      margin: 0;
    }
  }
`;

interface CellCheckboxProps {
  field: {
    name: string;
    state: { value: boolean };
    handleChange: (value: boolean) => void;
    handleBlur: () => void;
  };
}
export function CellCheckbox(props: CellCheckboxProps) {
  const { field } = props;

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    return field.handleChange(checked);
  }

  return (
    <CellCheckboxStyled
      name={field.name}
      value={String(field.state.value)}
      checked={field.state.value}
      onChange={onChange}
      onBlur={field.handleBlur}
    />
  );
}

import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ComponentProps } from 'react';
import type { ChangeCallbackProps } from 'react-science/ui';
import { ColorPickerDropdown } from 'react-science/ui';

interface CellColorPicker extends Omit<
  ComponentProps<typeof ColorPickerDropdown>,
  'color'
> {
  field: {
    state: { value: string };
    handleChange: (value: string) => void;
    handleBlur: () => void;
  };
}

export function CellColorPicker(props: CellColorPicker) {
  const { field } = props;

  function onChange(values: ChangeCallbackProps) {
    props.onChangeComplete?.(values);
    field.handleChange(values.hex);
  }

  return (
    <CellColorPickerContainer>
      <ColorPickerDropdown
        {...props}
        color={{ hex: field.state.value }}
        onChangeComplete={onChange}
        onBlur={field.handleBlur}
      />
    </CellColorPickerContainer>
  );
}

const CellColorPickerContainer = styled.div`
  .${Classes.POPOVER_TARGET} button {
    border: none;
  }
`;

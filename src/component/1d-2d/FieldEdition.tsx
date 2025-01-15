import type { PopoverProps } from '@blueprintjs/core';
import { Popover } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { Input2Controller } from '../elements/Input2Controller.js';
import { NumberInput2Controller } from '../elements/NumberInput2Controller.js';

const StyledPopover = styled(Popover)`
  .field-edition-popover {
    border-radius: 5px;
  }
`;

type InputType = 'number' | 'text';

interface FieldProps {
  value: number | string;
  inputType?: InputType;
  onChange: (value: any) => void;
}
interface FieldEditionsProps extends FieldProps {
  children: ReactNode;
  PopoverProps?: PopoverProps;
}
const InputDimension = { height: 28, width: 100 };

const validationSchema = (inputType: 'number' | 'text') =>
  Yup.object({
    value: (inputType === 'number' ? Yup.number() : Yup.string()).required(),
  });

function stopPropagation(e) {
  e.stopPropagation();
}

function keyDownCheck(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    return true;
  } else if (event.key === 'Escape') {
    return false;
  }
}

export function FieldEdition(props: FieldEditionsProps) {
  const { value, inputType = 'text', onChange, children, PopoverProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  function handleChange({ value: newValue }) {
    onChange(newValue);
    setIsOpen(false);
  }

  return (
    <StyledPopover
      popoverClassName="field-edition-popover"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onInteraction={() => setIsOpen(true)}
      content={
        <Field onChange={handleChange} value={value} inputType={inputType} />
      }
      {...PopoverProps}
    >
      {children}
    </StyledPopover>
  );
}

function Field(props: FieldProps) {
  const { value, inputType = 'text', onChange } = props;

  const { control, handleSubmit } = useForm({
    defaultValues: { value },
    resolver: yupResolver(validationSchema(inputType)),
  });

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (keyDownCheck(event)) {
      void handleSubmit(onChange)();
    }
  }

  const style = {
    height: `${InputDimension.height}px`,
    outline: 'none',
  };

  if (inputType === 'number') {
    return (
      <NumberInput2Controller
        name="value"
        control={control}
        style={style}
        onKeyDown={handleKeyDown}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        autoFocus
        buttonPosition="none"
      />
    );
  }

  return (
    <Input2Controller
      name="value"
      control={control}
      style={style}
      onKeyDown={handleKeyDown}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      autoFocus
    />
  );
}

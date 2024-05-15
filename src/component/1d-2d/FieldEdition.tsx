/** @jsxImportSource @emotion/react */
import { Popover, PopoverProps } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Formik } from 'formik';
import { ReactNode, useState } from 'react';
import * as Yup from 'yup';

import FormikInput from '../elements/formik/FormikInput';

type InputType = 'number' | 'text';

interface FieldEditionsProps {
  value: number | string;
  inputType?: InputType;
  onChange: (value: any) => void;
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

  function handleOnSubmit({ value: newValue }) {
    onChange(newValue);
    setIsOpen(false);
  }

  return (
    <Popover
      css={css`
        .field-edition-popover {
          border-radius: 5px;
        }
      `}
      popoverClassName="field-edition-popover"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onInteraction={() => setIsOpen(true)}
      content={
        <Formik
          initialValues={{ value }}
          onSubmit={handleOnSubmit}
          validationSchema={validationSchema(inputType)}
        >
          {({ submitForm }) => (
            <FormikInput
              type={inputType}
              style={{
                input: {
                  height: `${InputDimension.height}px`,
                  padding: '5px',
                  outline: 'none',
                },
              }}
              name="value"
              autoSelect
              onKeyDown={(e) => keyDownCheck(e) && submitForm()}
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
            />
          )}
        </Formik>
      }
      {...PopoverProps}
    >
      {children}
    </Popover>
  );
}

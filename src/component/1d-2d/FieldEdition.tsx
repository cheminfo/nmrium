import type { PopoverNextProps } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { AppForm, coerceNumberInput, useForm } from 'react-science/ui';
import { match } from 'ts-pattern';
import { z } from 'zod';

const StyledPopover = styled(PopoverNext)`
  .field-edition-popover {
    border-radius: 5px;
  }
`;

type InputType = 'number' | 'text';

interface FieldProps {
  value: number | string;
  inputType?: InputType;
  onChange: (value: string) => void;
}

interface FieldEditionsProps extends FieldProps {
  children: ReactNode;
  PopoverProps?: PopoverNextProps;
}

export function FieldEdition(props: FieldEditionsProps) {
  const { value, inputType = 'text', onChange, children, PopoverProps } = props;
  const [isOpen, setIsOpen] = useState(false);

  function handleChange(newValue: FieldEditionsProps['value']) {
    onChange(String(newValue));
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

function validationSchema(
  inputType: InputType,
): z.ZodType<{ value: string } | { value: number }, { value: string }> {
  return match(inputType)
    .with('number', () =>
      z.object({
        value: coerceNumberInput(),
      }),
    )
    .with('text', () =>
      z.object({
        value: z.string(),
      }),
    )
    .exhaustive();
}

function Field(props: FieldProps) {
  const { value, inputType = 'text', onChange } = props;

  const validation = useMemo(() => {
    return validationSchema(inputType).transform(({ value }) => {
      return String(value);
    });
  }, [inputType]);

  const form = useForm({
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: {
      value,
    },
    validators: {
      onDynamic: validation,
    },
    onSubmit: ({ value }) => {
      const parsedValue = validation.parse(value);
      onChange(parsedValue);
    },
  });

  return (
    <AppForm form={form}>
      <form.AppField name="value">
        {(field) =>
          inputType === 'number' ? (
            <field.NumericInput autoFocus />
          ) : (
            <field.Input autoFocus />
          )
        }
      </form.AppField>
    </AppForm>
  );
}

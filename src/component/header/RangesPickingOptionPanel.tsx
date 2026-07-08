import { Checkbox, FormGroup, NumericInput } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { FormEvent } from 'react';
import { useCallback } from 'react';
import { useForm } from 'react-science/ui';
import { z } from 'zod';

import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInWindowArea,
} from '../hooks/useCheckPointsNumberInWindowArea.js';

const validationZodSchema = z.object({
  minMaxRatio: z.number().min(0),
  lookNegative: z.boolean(),
});

type AutoRangesOptions = z.infer<typeof validationZodSchema>;

const defaultValues: AutoRangesOptions = {
  minMaxRatio: 0.05,
  lookNegative: false,
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

function RangesPickingOptionPanel() {
  const dispatch = useDispatch();

  const hasEnoughPoints = useCheckPointsNumberInWindowArea();
  const toaster = useToaster();

  function handleRangesPicking(values: AutoRangesOptions) {
    if (hasEnoughPoints) {
      dispatch({
        type: 'AUTO_RANGES_DETECTION',
        payload: values,
      });
    } else {
      toaster.show({
        message: `Auto range picking only available for area more than ${MIN_AREA_POINTS} points`,
        intent: 'danger',
      });
    }
  }

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    validators: {
      onDynamic: validationZodSchema,
    },
    onSubmit: ({ value }) => {
      const parsedValues = validationZodSchema.parse(value);
      handleRangesPicking(parsedValues);
    },
  });

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void form.handleSubmit(event);
    },
    [form],
  );

  return (
    <form noValidate onSubmit={onSubmit}>
      <form.AppForm>
        <FormContainer>
          <form.AppField name="lookNegative">
            {(field) => (
              <Checkbox
                style={{ marginBottom: 0 }}
                label="Detect negative"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={({ target: { checked } }) =>
                  field.handleChange(checked)
                }
              />
            )}
          </form.AppField>

          <form.AppField name="minMaxRatio">
            {(field) => (
              <FormGroup
                label="Min/max ratio:"
                inline
                style={{ marginBottom: 0 }}
              >
                <NumericInput
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  min={0}
                  stepSize={0.01}
                  minorStepSize={0.01}
                  onValueChange={(valueAsNumber) => {
                    field.handleChange(valueAsNumber);
                  }}
                />
              </FormGroup>
            )}
          </form.AppField>

          <div>
            <form.SubmitButton intent="success">
              Auto ranges picking
            </form.SubmitButton>
          </div>
        </FormContainer>
      </form.AppForm>
    </form>
  );
}

export default RangesPickingOptionPanel;

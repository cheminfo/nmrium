import { Button } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { MouseEvent } from 'react';
import { AppForm, useForm } from 'react-science/ui';
import { match } from 'ts-pattern';
import { z } from 'zod';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

type ShiftFilterPanelOptions =
  | ExtractFilterEntry<'shiftX'>
  | ExtractFilterEntry<'shift2DX'>
  | ExtractFilterEntry<'shift2DY'>;

const validationSchema = z.object({
  shift: z.coerce.number<string>().min(0),
});

type ShiftOptionsPanelOption = z.output<typeof validationSchema>;

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 5px;
`;

export default function ShiftOptionsPanel(
  props: BaseFilterOptionsPanelProps<ShiftFilterPanelOptions>,
) {
  const { filter, enableEdit = true, onCancel, onEditStart } = props;
  const dispatch = useDispatch();

  const form = useForm({
    defaultValues: {
      shift: filter.value.shift.toString(),
    },
    onSubmit: ({ value }) => {
      const parsedValues = validationSchema.parse(value);
      handleApplyFilter(parsedValues);
    },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    validators: {
      onDynamic: validationSchema,
    },
  });

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  function handleApplyFilter({ shift }: ShiftOptionsPanelOption) {
    return match(filter.name)
      .with('shiftX', () =>
        dispatch({ type: 'SHIFT_SPECTRUM', payload: { shift } }),
      )
      .with('shift2DX', () =>
        dispatch({ type: 'SHIFT_SPECTRUM', payload: { shiftX: shift } }),
      )
      .with('shift2DY', () =>
        dispatch({ type: 'SHIFT_SPECTRUM', payload: { shiftY: shift } }),
      )
      .exhaustive();
  }

  function handleCancel(event: MouseEvent<HTMLElement>) {
    handleCancelFilter();
    onCancel?.(event);
  }

  return (
    <AppForm form={form} layout="inline">
      <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
        {enableEdit && (
          <StickyHeader>
            <HeaderContainer>
              <div />

              <Container>
                <form.SubmitButton intent="success" size="small">
                  Apply
                </form.SubmitButton>
                <Button
                  variant="minimal"
                  intent="danger"
                  onClick={handleCancel}
                  size="small"
                >
                  Cancel
                </Button>
              </Container>
            </HeaderContainer>
          </StickyHeader>
        )}
        <Sections.Body>
          <form.AppField name="shift">
            {(field) => <field.NumericInput label="Shift" fill />}
          </form.AppField>
        </Sections.Body>
      </ReadOnly>
    </AppForm>
  );
}

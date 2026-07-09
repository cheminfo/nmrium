import { AppForm, Button, TooltipHelpContent, useForm } from 'react-science/ui';

import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.ts';
import { useActiveSpectra } from '../hooks/useActiveSpectra.ts';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInSelectedSpectra,
} from '../hooks/useCheckPointsNumberInWindowArea.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.ts';
import { z } from 'zod/v4';
import { revalidateLogic } from '@tanstack/react-form';
import styled from '@emotion/styled';
import { Classes, FormGroup, MenuItem, NumericInput } from '@blueprintjs/core';
import { type ItemRenderer, Select } from '@blueprintjs/select';

type Direction = 'positive' | 'negative' | 'both';

interface Item {
  label: string;
  value: Direction;
}

const LookFor: Item[] = [
  {
    label: 'Positive',
    value: 'positive',
  },
  {
    label: 'Negative',
    value: 'negative',
  },
  {
    label: 'Both',
    value: 'both',
  },
];

const validationSchema = z.object({
  maxNumberOfPeaks: z.coerce.number<string>().min(1),
  minMaxRatio: z.coerce.number<string>().min(0),
  noiseFactor: z.coerce.number<string>().min(0),
  direction: z.enum(['both', 'negative', 'positive']),
});

type AutoPeakPickingOptionsInput = z.input<typeof validationSchema>;
type AutoPeakPickingOptions = z.output<typeof validationSchema>;

const defaultValues: AutoPeakPickingOptionsInput = {
  maxNumberOfPeaks: '50',
  minMaxRatio: '0.05',
  noiseFactor: '3',
  direction: 'both',
};

const AppFormContainer = styled(AppForm)`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;

  .${Classes.FORM_GROUP} {
    margin-bottom: 0;
  }
`;

const renderDirection: ItemRenderer<Item> = (
  direction,
  { handleClick, handleFocus, modifiers },
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={direction.value}
      label={direction.label}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure="listoption"
      text={direction.label}
    />
  );
};

export function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();
  const hasEnoughPoints = useCheckPointsNumberInSelectedSpectra();
  const toaster = useToaster();
  const nucleus = useActiveNucleusTab();
  const activeSpectra = useActiveSpectra();
  const { defaultPeakShape } = usePanelPreferences('peaks', nucleus);
  const isSpectraSelected = activeSpectra && activeSpectra.length > 0;

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      const parsedValues = validationSchema.parse(value);
      handlePeakPicking(parsedValues);
    },
    validators: {
      onDynamic: validationSchema,
    },
  });

  function handlePeakPicking(values: AutoPeakPickingOptions) {
    if (hasEnoughPoints) {
      dispatch({
        type: 'AUTO_PEAK_PICKING',
        payload: {
          options: values,
          defaultPeakShape,
        },
      });
    } else {
      toaster.show({
        message: `Auto peak picking only available for area more than ${MIN_AREA_POINTS} points`,
        intent: 'danger',
      });
    }
  }

  return (
    <AppFormContainer form={form}>
      <form.AppField name="direction">
        {(field) => {
          const activeItem = LookFor.find(
            (item) => item.value === field.state.value,
          );

          return (
            <FormGroup label="Direction:" inline>
              <Select<Item>
                filterable={false}
                items={LookFor}
                itemRenderer={renderDirection}
                activeItem={activeItem}
                onItemSelect={(element) => {
                  field.handleChange(element.value);
                }}
              >
                <Button
                  text={activeItem?.label}
                  endIcon="double-caret-vertical"
                />
              </Select>
            </FormGroup>
          );
        }}
      </form.AppField>

      <form.AppField name="maxNumberOfPeaks">
        {(field) => (
          <FormGroup label="Max peaks:" inline>
            <NumericInput
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              min={1}
              style={{ width: '60px' }}
              stepSize={1}
              onValueChange={(_, valueAsString) => {
                field.handleChange(valueAsString);
              }}
            />
          </FormGroup>
        )}
      </form.AppField>

      <form.AppField name="noiseFactor">
        {(field) => (
          <FormGroup label="Noise:" inline>
            <NumericInput
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              min={1}
              style={{ width: '60px' }}
              stepSize={1}
              onValueChange={(_, valueAsString) => {
                field.handleChange(valueAsString);
              }}
            />
          </FormGroup>
        )}
      </form.AppField>

      <form.AppField name="minMaxRatio">
        {(field) => (
          <FormGroup label="Ratio:" inline>
            <NumericInput
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              style={{ width: '60px' }}
              min={0}
              stepSize={0.01}
              majorStepSize={0.01}
              minorStepSize={0.01}
              onValueChange={(_, valueAsString) => {
                field.handleChange(valueAsString);
              }}
            />
          </FormGroup>
        )}
      </form.AppField>

      <div>
        <form.SubmitButton
          tooltipProps={
            !isSpectraSelected
              ? {
                  intent: 'danger',
                  content: (
                    <TooltipHelpContent
                      title="Auto peak picking"
                      description="Select a one or more spectra to enable auto peak picking"
                    />
                  ),
                }
              : undefined
          }
          intent={isSpectraSelected ? 'success' : 'danger'}
        >
          Apply to {activeSpectra?.length} spectra
        </form.SubmitButton>
      </div>
    </AppFormContainer>
  );
}

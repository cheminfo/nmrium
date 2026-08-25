import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useMemo } from 'react';
import { AppForm, Button, coerceNumberInput, useForm } from 'react-science/ui';
import { z } from 'zod';

import { REFERENCES } from '../../../data/constants/References.js';
import type { CalibrateOptions } from '../../../data/data1d/Spectrum1D/getReferenceShift.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { useEvent } from '../../utility/Events.js';

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

interface AlignSpectraProps {
  nucleus: string;
  onClose: () => void;
}

type FormInput = z.input<typeof schemaValidation>;
type FormOutput = z.output<typeof schemaValidation>;

const DEFAULT_OPTIONS: FormInput = {
  from: '-1',
  to: '1',
  nbPeaks: '1',
  targetX: '0',
  options: 'manual',
};

const schemaValidation = z.object({
  from: coerceNumberInput(),
  to: coerceNumberInput(),
  nbPeaks: coerceNumberInput(),
  targetX: coerceNumberInput(),
  options: z.string(),
});

function checkSpectra(options: CalibrateOptions, spectra: Spectrum1D[]) {
  const { from, to } = options;
  for (const spectrum of spectra) {
    const {
      data: { x },
    } = spectrum;

    const min = x[0];
    const max = x.at(-1) as number;

    if (from < min || to > max) {
      throw new Error('Some spectra do not have data in the selected range');
    }

    if (Math.abs(xFindClosestIndex(x, from) - xFindClosestIndex(x, to)) < 10) {
      throw new Error(
        'The selected range is too small to provide accurate results',
      );
    }
  }
}

function checkOptions(options: CalibrateOptions) {
  const returnedOptions = { ...options };

  if (options.from > options.to) {
    returnedOptions.to = options.from;
    returnedOptions.from = options.to;
  }

  return returnedOptions;
}

function getList(nucleus: string) {
  const references = REFERENCES as any;

  if (!references?.[nucleus]) {
    return [];
  }

  const list = Object.entries(references[nucleus]).map((item) => ({
    value: item[0],
    label: item[0],
  }));

  return baseList.concat(list as any);
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100%;
  padding: 10px 0 5px 20px;

  .body {
    flex: 1;
    overflow: auto;
    padding: 10px 10px 25px 1px;
  }

  .header {
    font-size: 15px;
    font-weight: bold;
    padding: 5px 0;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
`;

export default function AlignSpectra(props: AlignSpectraProps) {
  const { onClose = () => null, nucleus } = props;
  const spectra = useSpectraByActiveNucleus();
  const dispatch = useDispatch();
  const toaster = useToaster();

  const optionList = useMemo(() => {
    return getList(nucleus);
  }, [nucleus]);

  const form = useForm({
    defaultValues: {
      ...DEFAULT_OPTIONS,
      options: optionList[0].value,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    onSubmit: ({ value, formApi }) => {
      const parsed = schemaValidation.parse(value);
      const options = checkOptions(parsed);

      formApi.reset(
        schemaValidation.encode({
          ...options,
          options: optionList[0].value,
        }),
      );

      try {
        checkSpectra(options, spectra as Spectrum1D[]);
        dispatch({ type: 'ALIGN_SPECTRA', payload: options });
        onClose();
      } catch (error: unknown) {
        const message = (error as Error).message;
        toaster.show({ intent: 'danger', message });
      }
    },
    validators: {
      onDynamic: schemaValidation,
    },
  });

  useEvent({
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;

      if (shiftKey) {
        form.setFieldValue('from', String(from));
        form.setFieldValue('to', String(to));
      }
    },
  });

  function optionChangeHandlerRefactor(key: string) {
    const { delta: targetX = 0, ...otherOptions } =
      (REFERENCES as any)?.[nucleus]?.[key] || {};

    form.reset(
      schemaValidation.encode({
        from: otherOptions.from ?? Number(DEFAULT_OPTIONS.from),
        to: otherOptions.to ?? Number(DEFAULT_OPTIONS.to),
        nbPeaks: otherOptions.nbPeaks ?? Number(DEFAULT_OPTIONS.nbPeaks),
        options: key,
        targetX,
      }),
    );
  }

  return (
    <AppForm form={form} layout="inline">
      <Container>
        <div className="body">
          <form.Section title="Spectra calibration">
            <form.AppField
              name="options"
              listeners={{
                onChange: ({ value }) => {
                  optionChangeHandlerRefactor(value);
                },
              }}
            >
              {(field) => <field.Select label="Options" items={optionList} />}
            </form.AppField>
          </form.Section>

          <form.Section title="Range">
            <form.AppField name="from">
              {(field) => <field.NumericInput label="From" fill />}
            </form.AppField>

            <form.AppField name="to">
              {(field) => <field.NumericInput label="To" fill />}
            </form.AppField>
          </form.Section>

          <form.Section title="Configuration">
            <form.AppField name="nbPeaks">
              {(field) => <field.NumericInput label="Number of peaks" />}
            </form.AppField>

            <form.AppField name="targetX">
              {(field) => <field.NumericInput label="Target PPM" />}
            </form.AppField>
          </form.Section>
        </div>
        <Footer>
          <form.SubmitButton intent="success">Apply</form.SubmitButton>

          <Button intent="danger" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Footer>
      </Container>
    </AppForm>
  );
}

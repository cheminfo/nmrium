import { Button } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { translateMultiplet } from 'nmr-processing';
import { CSSProperties, useEffect } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import * as Yup from 'yup';

import { useChartData } from '../../../../context/ChartContext';
import { NumberInput2Controller } from '../../../../elements/NumberInput2Controller';
import { usePanelPreferences } from '../../../../hooks/usePanelPreferences';
import { useEvent } from '../../../../utility/Events';
import { formatNumber } from '../../../../utility/formatNumber';

const styles: Record<
  'container' | 'innerContainer' | 'infoText',
  CSSProperties
> = {
  container: {
    padding: '0.4rem',
  },
  innerContainer: {
    width: '70%',
    display: 'block',
    margin: 'auto',
  },
  infoText: {
    padding: '10px 0',
    fontSize: '13px',
    textAlign: 'left',
  },
};

interface NewSignalTabProps {
  range: any;
}

export function NewSignalTab(props: NewSignalTabProps) {
  const { range } = props;
  const { setValue } = useFormContext();
  const { signals, signalIndex } = useWatch();

  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  function saveHandler(val) {
    const newSignal = {
      multiplicity: 'm',
      kind: 'signal',
      delta: val.delta,
      js: [{ multiplicity: translateMultiplet('m'), coupling: '' }],
    };
    const _signals = signals.slice().concat(newSignal);

    setValue('signals', _signals);
    setValue('signalIndex', String(_signals.length - 1));
  }
  const { handleSubmit, reset, control, setFocus } = useForm({
    defaultValues: {
      delta: (range.from + range.to) / 2,
    },
    resolver: yupResolver(getSignalValidationSchema(range)),
  });

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (signalIndex === -1 && shiftKey) {
        reset({ delta: xPPM });
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (signalIndex === -1 && shiftKey) {
        reset({ delta: (to - from) / 2 + from });
      }
    },
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        setFocus('delta', { shouldSelect: true });
      }, 0);
    });
  });

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <p style={styles.infoText}>
          Edit or select a delta value of new signal in range [
          {`${formatNumber(
            range.from,
            rangesPreferences.from.format,
          )} ppm - ${formatNumber(range.to, rangesPreferences.to.format)} ppm`}
          ]:
        </p>
        <NumberInput2Controller
          control={control}
          name="delta"
          placeholder={`𝛅(ppm)`}
          autoSelect
          fill
        />
        <Button
          intent="success"
          style={{
            marginTop: '20px',
          }}
          onClick={() => handleSubmit(saveHandler)()}
        >
          Add a signal
        </Button>
      </div>
    </div>
  );
}

function getSignalValidationSchema(range) {
  return Yup.object().shape({
    delta: Yup.number()
      .test(`test-range`, '', function testNewSignalDelta(value) {
        // eslint-disable-next-line no-invalid-this
        const { path, createError } = this;
        if (value && value >= range.from && value <= range.to) {
          return true;
        }

        const errorMessage = ` ${
          value ? value.toFixed(5) : 0
        } ppm out of the range`;
        return createError({ path, message: errorMessage });
      })
      .required(),
  });
}

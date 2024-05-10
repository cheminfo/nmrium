import { Formik, useFormikContext } from 'formik';
import { translateMultiplet } from 'nmr-processing';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

import { useChartData } from '../../../../context/ChartContext';
import Button from '../../../../elements/Button';
import FormikInput from '../../../../elements/formik/FormikInput';
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
  const { values, setFieldValue } = useFormikContext<any>();
  const [signalValue, setSignalValue] = useState<number>(
    (range.from + range.to) / 2,
  );
  const newSignalFormRef = useRef<any>();
  const inputRef = useRef<HTMLInputElement>(null);
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
      delta: Number(val.newSignalDelta),
      js: [{ multiplicity: translateMultiplet('m'), coupling: '' }],
    };
    const _signals = values.signals.slice().concat(newSignal);

    void setFieldValue('signals', _signals);
    void setFieldValue('signalIndex', String(_signals.length - 1));
  }

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (values.signalIndex === '-1' && shiftKey) {
        setSignalValue(xPPM);
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (values.signalIndex === '-1' && shiftKey) {
        setSignalValue((to - from) / 2 + from);
      }
    },
  });

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.select();
    }, 50);
  }, [signalValue]);

  return (
    <div style={styles.container}>
      <Formik
        innerRef={newSignalFormRef}
        validationSchema={getSignalValidationSchema(range)}
        initialValues={{
          newSignalDelta: signalValue,
        }}
        enableReinitialize
        onSubmit={saveHandler}
      >
        <div style={styles.innerContainer}>
          <p style={styles.infoText}>
            Edit or select a delta value of new signal in range [
            {`${formatNumber(
              range.from,
              rangesPreferences.from.format,
            )} ppm - ${formatNumber(range.to, rangesPreferences.to.format)} ppm`}
            ]:
          </p>
          <FormikInput
            ref={inputRef}
            name="newSignalDelta"
            type="number"
            placeholder={`𝛅(ppm)`}
            style={{
              input: {
                height: '30px',
                padding: '0.25rem 0.5rem',
              },
            }}
            autoSelect
            checkErrorAfterInputTouched={false}
          />
          <Button.Done
            style={{
              marginTop: '20px',
              height: '30px',
            }}
            onClick={() => newSignalFormRef.current.submitForm()}
          >
            Add a signal
          </Button.Done>
        </div>
      </Formik>
    </div>
  );
}

function getSignalValidationSchema(range) {
  return Yup.object().shape({
    newSignalDelta: Yup.number()
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

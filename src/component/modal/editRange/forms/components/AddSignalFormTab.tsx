import { Formik, useFormikContext } from 'formik';
import { WorkSpacePanelPreferences } from 'nmr-load-save';
import { translateMultiplet } from 'nmr-processing';
import { CSSProperties, forwardRef } from 'react';
import * as Yup from 'yup';

import Button from '../../../../elements/Button';
import FormikInput from '../../../../elements/formik/FormikInput';
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

interface AddSignalFormTabProps {
  onFocus: (element: any) => void;
  onBlur?: () => void;
  range: any;
  preferences: WorkSpacePanelPreferences['ranges'];
}

// TODO: this seems to be a hacky use of ref.
function AddSignalFormTab(
  { onFocus, onBlur, range, preferences }: AddSignalFormTabProps,
  ref: any,
) {
  const { values, setFieldValue } = useFormikContext<any>();

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

  return (
    <div style={styles.container}>
      <Formik
        innerRef={ref}
        validationSchema={getSignalValidationSchema(range)}
        initialValues={{
          newSignalDelta: (range.from + range.to) / 2,
        }}
        onSubmit={saveHandler}
      >
        <div style={styles.innerContainer}>
          <p style={styles.infoText}>
            Edit or select a delta value of new signal in range [
            {`${formatNumber(
              range.from,
              preferences.from.format,
            )} ppm - ${formatNumber(range.to, preferences.to.format)} ppm`}
            ]:
          </p>
          <FormikInput
            name="newSignalDelta"
            type="number"
            placeholder={`𝛅(ppm)`}
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              input: {
                height: '30px',
                padding: '0.25rem 0.5rem',
              },
            }}
            checkErrorAfterInputTouched={false}
          />
          <Button.Done
            style={{
              marginTop: '20px',
              height: '30px',
            }}
            onClick={() => ref.current.submitForm()}
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

export default forwardRef(AddSignalFormTab);

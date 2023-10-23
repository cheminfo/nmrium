/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik } from 'formik';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { REFERENCES } from '../../../data/constants/References';
import { CalibrateOptions } from '../../../data/data1d/Spectrum1D/getReferenceShift';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import Message from '../../elements/Message';
import Select from '../../elements/Select';
import FormikInput from '../../elements/formik/FormikInput';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import Events from '../../utility/Events';

const labelStyle: LabelStyle = {
  label: { flex: 4, fontWeight: '500' },
  wrapper: { flex: 8, display: 'flex', alignItems: 'center' },
  container: { padding: '5px 0' },
};

const inputStyle: InputStyle = {
  input: {
    padding: '5px',
  },
};

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

interface AlignSpectraProps {
  nucleus: any;
  onClose: () => void;
}

const DEFAULT_OPTIONS: CalibrateOptions = {
  from: -1,
  to: 1,
  nbPeaks: 1,
  targetX: 0,
};

const schemaValidation = Yup.object({
  from: Yup.number().required(),
  to: Yup.number().required(),
  nbPeaks: Yup.number().required(),
  targetX: Yup.number().required(),
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

function getList(nucleus) {
  if (!REFERENCES?.[nucleus]) {
    return [];
  }
  const list = Object.entries(REFERENCES[nucleus]).map((item) => ({
    value: item[0],
    label: item[0],
  }));

  return baseList.concat(list as any);
}

function AlignSpectra({ onClose = () => null, nucleus }: AlignSpectraProps) {
  const spectra = useSpectraByActiveNucleus();
  const dispatch = useDispatch();
  const [options, setOptions] = useState<CalibrateOptions>(DEFAULT_OPTIONS);
  const [error, setError] = useState<string>('');
  function submitHandler(inputOptions) {
    const options = checkOptions(inputOptions);
    setOptions(options);
    try {
      checkSpectra(options, spectra as Spectrum1D[]);

      dispatch({ type: 'ALIGN_SPECTRA', payload: options });
      onClose();
    } catch (error: unknown) {
      const message = (error as Error).message;
      setError(message);
    }
  }

  useEffect(() => {
    function handler(event: any) {
      const [from, to] = event.range;
      setOptions((prevOptions) => ({ ...prevOptions, from, to }));
    }

    Events.on('brushEnd', handler);

    return () => {
      Events.off('brushEnd', handler);
    };
  }, []);

  function optionChangeHandler(key) {
    const { delta: targetX = 0, ...otherOptions } =
      REFERENCES?.[nucleus]?.[key] || {};
    const value = {
      ...DEFAULT_OPTIONS,
      targetX,
      ...otherOptions,
    };

    setOptions(value);
    setError('');
  }
  const List = getList(nucleus);

  const styles = css`
    max-height: 100%;
    padding: 10px 0 5px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;

    .body {
      overflow: auto;
      padding: 10px 10px 25px 0;
    }

    .header {
      padding: 5px 0;
      font-size: 15px;
      font-weight: bold;
    }

    .footer {
      display: flex;
      padding-top: 5px;
    }
  `;

  return (
    <div css={styles}>
      <Formik
        initialValues={options}
        enableReinitialize
        onSubmit={submitHandler}
        validationSchema={schemaValidation}
        validate={() => setError('')}
      >
        {({ submitForm }) => (
          <>
            <div className="body" style={{ flex: 1 }}>
              <div className="header">
                <span>Spectra calibration</span>
              </div>
              {error && <Message type="error">{error}</Message>}
              <Label title="Options" style={labelStyle}>
                <Select
                  items={List}
                  style={{ width: '100%', height: 30 }}
                  onChange={optionChangeHandler}
                />
              </Label>

              <Label title="Range" style={labelStyle}>
                <Label title="From">
                  <FormikInput name="from" type="number" style={inputStyle} />
                </Label>
                <Label title="To" style={{ label: { padding: '0 10px' } }}>
                  <FormikInput name="to" type="number" style={inputStyle} />
                </Label>
              </Label>

              <Label title="Number of Peaks" style={labelStyle}>
                <FormikInput name="nbPeaks" type="number" style={inputStyle} />
              </Label>
              <Label title="Target PPM" style={labelStyle}>
                <FormikInput name="targetX" type="number" style={inputStyle} />
              </Label>
            </div>
            <div className="footer">
              <Button.Done
                style={{ padding: '5px 14px', fontSize: 14 }}
                onClick={submitForm}
              >
                Done
              </Button.Done>
            </div>
          </>
        )}
      </Formik>
    </div>
  );
}

export default AlignSpectra;

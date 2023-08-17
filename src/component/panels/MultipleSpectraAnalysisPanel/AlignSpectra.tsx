/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik } from 'formik';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { REFERENCES } from '../../../data/constants/References';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import Select from '../../elements/Select';
import FormikInput from '../../elements/formik/FormikInput';
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

function AlignSpectra({ onClose = () => null, nucleus }: AlignSpectraProps) {
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map((item) => ({
          value: item[0],
          label: item[0],
        }))
      : [];

    return baseList.concat(list as any);
  }, [nucleus]);

  useEffect(() => {
    dispatch({ type: 'RESET_SELECTED_TOOL' });
  }, [dispatch]);

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
    onClose();
  }, [onClose]);

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: 'ALIGN_SPECTRA', payload: values });
      onClose();
    },
    [dispatch, onClose],
  );

  useEffect(() => {
    function handler(event: any) {
      const [from, to] = event.range;
      refForm.current.setValues({ ...refForm.current.values, from, to });
    }

    Events.on('brushEnd', handler);

    return () => {
      Events.off('brushEnd', handler);
    };
  }, []);

  const optionChangeHandler = useCallback(
    (id) => {
      const value = REFERENCES[nucleus][id];
      const { delta = 0, ...resValues } = value || { delta: 0 };
      refForm.current.setValues({
        ...refForm.current.values,
        targetX: delta,
        ...resValues,
      });
    },
    [nucleus],
  );

  const styles = css`
    max-height: 100%;
    padding: 10px 0 5px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
    .body {
      overflow: auto;
      padding: 5px 0;
    }

    .header {
      padding: 5px 0;
      font-size: 15;
      font-weight: bold;
    }
    .footer {
      display: flex;
      padding-top: 5px;
    }
  `;

  return (
    <div css={styles}>
      <div className="body" style={{ flex: 1 }}>
        <div className="header">
          <span>Spectra calibration</span>
        </div>
        <Formik
          innerRef={refForm}
          initialValues={{ from: -1, to: 1, nbPeaks: 1, targetX: 0 }}
          onSubmit={submitHandler}
        >
          <>
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
          </>
        </Formik>
      </div>
      <div className="footer">
        <Button.Done
          style={{ padding: '5px 14px', fontSize: 14 }}
          onClick={handleSave}
        >
          Save
        </Button.Done>
      </div>
    </div>
  );
}

export default AlignSpectra;

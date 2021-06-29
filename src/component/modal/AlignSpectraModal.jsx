/** @jsxImportSource @emotion/react */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { REFERENCES } from '../../data/constants/References';
import { useDispatch } from '../context/DispatchContext';
import CloseButton from '../elements/CloseButton';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import { ALIGN_SPECTRA } from '../reducer/types/Types';
import Events from '../utility/Events';

import { ModalStyles } from './ModalStyle';

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

function AlignSpectraModal({ onClose = () => null, nucleus }) {
  const refForm = useRef();
  const dispatch = useDispatch();
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map(
          (item) => ({
            key: item[0],
            value: item[0],
            label: item[0],
          }),
          [],
        )
      : [];

    return baseList.concat(list);
  }, [nucleus]);
  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: ALIGN_SPECTRA, payload: values });
      onClose();
    },
    [dispatch, onClose],
  );

  useEffect(() => {
    Events.on('brushEnd', (event) => {
      const [from, to] = event.range;
      refForm.current.setValues({ ...refForm.current.values, from, to });
    });

    return () => {
      Events.off('brushEnd');
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

  return (
    <div css={ModalStyles}>
      <div className="header handle">
        <span>Spectra calibration</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={refForm}
          initialValues={{ from: -1, to: 1, nbPeaks: 1, targetX: 0 }}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Options :</span>

            <Select
              data={List}
              style={{ width: 270, height: 30, marginBottom: '20px' }}
              onChange={optionChangeHandler}
            />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Range :</span>
            <FormikInput label="From : " name="from" type="number" />
            <FormikInput label="To :" name="to" type="number" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Number of Peaks : </span>
            <FormikInput name="nbPeaks" type="number" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Target PPM :</span>
            <FormikInput name="targetX" type="number" />
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="btn">
          Done
        </button>
      </div>
    </div>
  );
}

export default AlignSpectraModal;

/** @jsxImportSource @emotion/react */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { REFERENCES } from '../../data/constants/References';
import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CloseButton from '../elements/CloseButton';
import Label from '../elements/Label';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import { ALIGN_SPECTRA } from '../reducer/types/Types';
import Events from '../utility/Events';

import { ModalStyles } from './ModalStyle';

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

interface AlignSpectraModalProps {
  onClose?: (element?: string) => void;
  nucleus: any;
}

function AlignSpectraModal({
  onClose = () => null,
  nucleus,
}: AlignSpectraModalProps) {
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map(
          (item) => ({
            value: item[0],
            label: item[0],
          }),
          [],
        )
      : [];

    return baseList.concat(list as any);
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

  return (
    <div css={ModalStyles}>
      <div className="header handle">
        <span>Spectra calibration</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content" style={{ flex: 1 }}>
        <FormikForm
          ref={refForm}
          initialValues={{ from: -1, to: 1, nbPeaks: 1, targetX: 0 }}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Options :</span>

            <Select
              items={List}
              style={{ width: 270, height: 30, marginBottom: '20px' }}
              onChange={optionChangeHandler}
            />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Range :</span>
            <Label title="From : ">
              <FormikInput name="from" type="number" />
            </Label>
            <Label title="To : ">
              <FormikInput name="to" type="number" />
            </Label>
          </div>
          <div className=" margin-10">
            <Label className="custom-label" title="Number of Peaks : ">
              <FormikInput name="nbPeaks" type="number" />
            </Label>
          </div>
          <div className=" margin-10">
            <Label className="custom-label" title="Target PPM :">
              <FormikInput name="targetX" type="number" />
            </Label>
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <Button.Done onClick={handleSave}>Done</Button.Done>
      </div>
    </div>
  );
}

export default AlignSpectraModal;

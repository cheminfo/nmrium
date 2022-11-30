/** @jsxImportSource @emotion/react */
import { Formik } from 'formik';
import { useCallback, useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext';
import Button from '../elements/Button';
import CloseButton from '../elements/CloseButton';
import Label from '../elements/Label';
import FormikInput from '../elements/formik/FormikInput';
import Events from '../utility/Events';
import { exportAsMatrix } from '../utility/export';

import { ModalStyles } from './ModalStyle';

const INITIAL_VALUE = { from: -1, to: 1, nbPoints: 1024 };

interface ExportAsMatrixModalProps {
  onClose?: (element?: string) => void;
}

function ExportAsMatrixModal({
  onClose = () => null,
}: ExportAsMatrixModalProps) {
  const refForm = useRef<any>();
  const { data } = useChartData();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (options) => {
      exportAsMatrix(data, options, 'fileName');
      onClose();
    },
    [data, onClose],
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

  return (
    <div css={ModalStyles}>
      <div className="header handle">
        <span>Export spectra as a Matrix</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <Formik
          innerRef={refForm}
          initialValues={INITIAL_VALUE}
          onSubmit={submitHandler}
        >
          <>
            <div className="row margin-10">
              <span className="custom-label">Range :</span>
              <Label title="From : ">
                <FormikInput name="from" type="number" />
              </Label>
              <Label title="To : ">
                <FormikInput name="to" type="number" />
              </Label>
            </div>
            <div className="row margin-10">
              <Label title="Number of Points :" className="custom-label">
                <FormikInput name="nbPoints" type="number" />
              </Label>
            </div>
          </>
        </Formik>
      </div>
      <div className="footer-container">
        <Button.Done onClick={handleSave}>Export Now</Button.Done>
      </div>
    </div>
  );
}

export default ExportAsMatrixModal;

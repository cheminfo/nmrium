/** @jsxImportSource @emotion/react */
import { useCallback, useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext';
import CloseButton from '../elements/CloseButton';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import Events from '../utility/Events';
import { exportAsMatrix } from '../utility/Export';

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
        <FormikForm
          ref={refForm}
          initialValues={INITIAL_VALUE}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Range :</span>
            <FormikInput label="From : " name="from" type="number" />
            <FormikInput label="To :" name="to" type="number" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Number of Points : </span>
            <FormikInput name="nbPoints" type="number" />
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="btn">
          Export Now
        </button>
      </div>
    </div>
  );
}

export default ExportAsMatrixModal;

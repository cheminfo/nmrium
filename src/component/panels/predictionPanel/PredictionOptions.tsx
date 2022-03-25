/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';
import * as Yup from 'yup';

import {
  PredictionOptions as PredictionOptionsInterface,
  defaultPredictionOptions,
  FREQUENCIES,
} from '../../../data/PredictionManager';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Label from '../../elements/Label';
import FormikErrorsSummary from '../../elements/formik/FormikErrorsSummary';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';

const styles = css`
  padding: 10px;
  border-top: solid #f2f2f2 1px;

  .row {
    flex: row;
    display: flex;
    padding-bottom: 10px;
  }

  .inner-content {
    flex: 1;
  }

  .custom-label {
    width: 160px;
  }

  .footer-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-end;
  }

  .btn:not([disabled]):hover {
    background-color: #ffffff;
  }
  .btn:hover {
    background-color: #f2f2f2 !important;
  }
  .btn:disabled {
    opacity: 0.5;
  }
  .btn {
    border: none;
    padding: 0 15px;
    background-color: #ffffff;
    border-radius: 5px;
    height: 25px;
  }

  .input {
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #cccccc;
    padding: 5px;
    width: 100px;
    margin-right: 10px;
    height: initial !important;
  }
`;

const predictionFormValidation = Yup.object().shape({
  frequency: Yup.number().integer().required().label('Frequency'),
  '1d': Yup.object({
    '1H': Yup.object({
      from: Yup.number().integer().required().label("1H ' From ' "),
      to: Yup.number().integer().required().label("1H ' To ' "),
    }),
    '13C': Yup.object().shape({
      from: Yup.number().integer().required().label("13C ' From ' "),
      to: Yup.number().integer().required().label("13C ' To ' "),
    }),
    lineWidth: Yup.number().integer().min(1).required().label('Line Width'),
  }),
});

interface PredictionOptionsProps {
  onPredict?: (options?: PredictionOptionsInterface) => void;
}

function PredictionOptions({ onPredict = () => null }: PredictionOptionsProps) {
  const refForm = useRef<any>();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      void (async () => {
        onPredict(values);
      })();
    },
    [onPredict],
  );

  return (
    <div css={styles}>
      <div>
        <FormikForm
          ref={refForm}
          initialValues={defaultPredictionOptions}
          validationSchema={predictionFormValidation}
          onSubmit={submitHandler}
        >
          <FormikErrorsSummary />
          <div className="row margin-10">
            <span className="custom-label">Frequency : </span>
            <FormikSelect
              data={FREQUENCIES}
              style={{ width: 290, height: 30, margin: 0 }}
              name="frequency"
            />
          </div>

          <div className="row">
            <IsotopesViewer value="1H" className="custom-label" />
            <Label title="From">
              <FormikInput name="1d.1H.from" type="number" />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="1d.1H.to" type="number" />
            </Label>
          </div>
          <div className="row">
            <IsotopesViewer value="13C" className="custom-label" />
            <Label title="From">
              <FormikInput name="1d.13C.from" type="number" />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="1d.13C.to" type="number" />
            </Label>
          </div>
          <div className="row margin-10 padding-h-10">
            <span className="custom-label">Line Width : </span>
            <FormikInput
              name="1d.lineWidth"
              type="number"
              style={{ input: { margin: 0 } }}
            />
            <span style={{ paddingLeft: '0.4rem' }}> Hz </span>
          </div>
        </FormikForm>
      </div>
      <div>
        <button type="button" onClick={handleSave} className="btn">
          Predict spectrum
        </button>
      </div>
    </div>
  );
}

export default PredictionOptions;

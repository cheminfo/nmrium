/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import CloseButton from '../elements/CloseButton';
import IsotopesViewer from '../elements/IsotopesViewer';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import FormikSelect from '../elements/formik/FormikSelect';
import { PREDICT_SPECTRA, SET_LOADING_FLAG } from '../reducer/types/Types';

const styles = css`
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    text-align: center;
    padding: 10px 0 10px 0px;
    margin: 0px;
    color: #005d9e;
    place-items: normal;
    text-transform: none;
    background-color: #fcfcfc;
  }

  .tab-content {
    width: 100%;
  }
  .row {
    display: flex;
    align-items: center;
  }

  .inner-content {
    padding: 15px 30px;
    width: 100%;
    flex: 1;
  }

  button:focus {
    outline: none;
  }
  button:hover {
    color: #007bff;
  }
  .save-button:hover {
    background-color: #ffffff;
  }
  .save-button {
    border: none;
    padding: 0 15px;
    background-color: #ffffff5e;
    border-radius: 5px;
    height: 25px;
  }

  .footer-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    background: rgb(242, 242, 242);
    background: -moz-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: -webkit-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f2f2f2",endColorstr="#ffffff",GradientType=1);
    padding: 6px 15px;
    height: 55px;
  }

  .section-header {
    font-size: 13px;
    color: #2ca8ff;
    margin-bottom: 10px;
    border-bottom: 0.55px solid #f9f9f9;
    padding: 6px 2px;
  }

  .custom-label {
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
    width: 155px;
  }
  .margin-10 {
    margin: 10px 0;
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

  .close-bt {
    border: none;
    color: red;
    background-color: transparent;
    outline: none;
    position: absolute;
    right: 10px;
    top: 2px;
    width: 30px;
    height: 30px;
  }
`;

const FREQUENCIES = [
  { key: 1, value: 60, label: '60 MHz' },
  { key: 2, value: 100, label: '100 MHz' },
  { key: 3, value: 200, label: '200 MHz' },
  { key: 4, value: 300, label: '300 MHz' },
  { key: 5, value: 400, label: '400 MHz' },
  { key: 6, value: 500, label: '500 MHz' },
  { key: 7, value: 600, label: '600 MHz' },
  { key: 8, value: 800, label: '800 MHz' },
  { key: 9, value: 1000, label: '1000 MHz' },
  { key: 10, value: 1200, label: '1200 MHz' },
];

const INITIAL_VALUE = {
  '1h': { from: -1, to: 12 },
  '13c': { from: -5, to: 220 },
  frequency: 400,
  spectra: {
    '1h': true,
    '13c': false,
    cosy: false,
    hsqc: false,
    hmbc: false,
  },
};

function PredictSpectraModal({ onClose, molfile }) {
  const refForm = useRef();
  const dispatch = useDispatch();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      dispatch({
        type: SET_LOADING_FLAG,
        isLoading: true,
      });
      dispatch({
        type: PREDICT_SPECTRA,
        payload: { mol: molfile, options: values },
      });
      onClose();
    },
    [dispatch, molfile, onClose],
  );

  return (
    <div css={styles}>
      <div className="header handle">
        <span>Predict Spectra</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={refForm}
          initialValues={INITIAL_VALUE}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Spectrometer Frequency :</span>

            <FormikSelect
              data={FREQUENCIES}
              style={{ width: 290, height: 30, margin: 0 }}
              name="frequency"
            />
          </div>
          <div className="row margin-10">
            <IsotopesViewer value="1H" className="custom-label" />
            <FormikInput
              label="From"
              name="1h.from"
              type="number"
              style={{ label: { padding: '0 10px 0 0' } }}
            />
            <FormikInput
              label="To"
              name="1h.to"
              type="number"
              style={{ label: { padding: '0 10px' } }}
            />
          </div>
          <div className="row margin-10">
            <IsotopesViewer value="13C" className="custom-label" />
            <FormikInput
              label="From"
              name="13c.from"
              type="number"
              style={{ label: { padding: '0 10px 0 0' } }}
            />
            <FormikInput
              label="To"
              name="13c.to"
              type="number"
              style={{ label: { padding: '0 10px' } }}
            />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Spectra </span>
          </div>
          <div
            className="row margin-10"
            style={{ justifyContent: 'space-between' }}
          >
            <div className="row">
              <FormikCheckBox name="spectra.1h" />
              <IsotopesViewer value="1H" style={{ padding: ' 0 10px' }} />
            </div>
            <div className="row">
              <FormikCheckBox disabled name="spectra.13c" />
              <IsotopesViewer value="13C" style={{ padding: ' 0 10px' }} />
            </div>
            <div className="row">
              <FormikCheckBox disabled name="spectra.cosy" />
              <IsotopesViewer value="cosy" style={{ padding: ' 0 10px' }} />
            </div>
            <div className="row">
              <FormikCheckBox disabled name="spectra.hsqc" />
              <IsotopesViewer value="HSQC" style={{ padding: ' 0 10px' }} />
            </div>
            <div className="row">
              <FormikCheckBox disabled name="spectra.hmbc" />
              <IsotopesViewer value="HMBC" style={{ padding: ' 0 10px' }} />
            </div>
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="save-button">
          Start Predicting
        </button>
      </div>
    </div>
  );
}

export default PredictSpectraModal;

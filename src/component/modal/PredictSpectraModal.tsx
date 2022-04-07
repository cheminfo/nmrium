/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef, useState, useMemo } from 'react';
import * as Yup from 'yup';

import {
  defaultPredictionOptions,
  FREQUENCIES,
} from '../../data/PredictionManager';
import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CheckBox from '../elements/CheckBox';
import CloseButton from '../elements/CloseButton';
import IsotopesViewer from '../elements/IsotopesViewer';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikErrorsSummary from '../elements/formik/FormikErrorsSummary';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import FormikSelect from '../elements/formik/FormikSelect';
import { useAlert } from '../elements/popup/Alert';
import { PREDICT_SPECTRA, SET_LOADING_FLAG } from '../reducer/types/Types';
import { useStateWithLocalStorage } from '../utility/LocalStorage';

import { ModalStyles } from './ModalStyle';

const styles = css`
  .row {
    align-items: center;
  }

  .inner-content {
    flex: 1;
  }

  .custom-label {
    width: 160px;
    font-weight: 500;
  }

  .nucleus-label {
    padding: 0 10px;
    color: black;
    font-weight: 700;

    &.disabled {
      opacity: 0.5;
      color: black;
    }
  }
  .warning {
    color: #c40000;
    font-weight: bold;
    font-size: 13px;
    text-align: justify;
    margin-top: 30px;
  }

  .warning-container {
    margin-top: 5px;
    display: flex;
    input {
      margin: 5px 5px 5px 0;
    }
  }

  .middle-x {
    padding: 0 10px;
  }

  .group-label {
    width: 100%;
    display: block;
    border-bottom: 1px solid #efefef;
    padding-bottom: 5px;
    font-weight: 600;
    color: #005d9e;
  }
`;

const NUMBER_OF_POINTS_1D = generateNumbersPowerOfX(12, 19);
const NUMBER_OF_POINTS_2D = generateNumbersPowerOfX(10, 10, {
  format: (value) => value,
});

const predictionFormValidation = Yup.object().shape({
  name: Yup.string().required().label('Name'),
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
    nbPoints: Yup.number().integer().required().label('1D Number Of Points'),
  }),
  '2d': Yup.object({
    nbPoints: Yup.object({
      x: Yup.number().integer().required().label('2D Number Of Points'),
      y: Yup.number().integer().required().label('2D Number Of Points'),
    }),
  }),
  spectra: Yup.object({
    proton: Yup.boolean(),
    carbon: Yup.boolean(),
    cosy: Yup.boolean(),
    hsqc: Yup.boolean(),
    hmbc: Yup.boolean(),
  }).test(
    'check-options',
    'You must check one of the options to start prediction',
    (obj) => {
      if (Object.values(obj).includes(true)) {
        return true;
      }
      return false;
    },
  ),
});

interface PredictSpectraModalProps {
  onClose?: (element?: string) => void;
  molfile: any;
}

function PredictSpectraModal({
  onClose = () => null,
  molfile,
}: PredictSpectraModalProps) {
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [isApproved, setApproved] = useState(false);
  const [predictionPreferences, setPredictionPreferences] =
    useStateWithLocalStorage('nmrium-prediction-preferences');

  const {
    toolOptions: {
      data: { predictionIndex },
    },
  } = useChartData();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const initValues = useMemo(() => {
    const { isApproved: isAgree, ...options } = predictionPreferences;
    setApproved(isAgree);
    return Object.assign(defaultPredictionOptions, options, {
      name: `Prediction ${predictionIndex + 1}`,
    });
  }, [predictionPreferences, predictionIndex]);

  const submitHandler = useCallback(
    (values) => {
      void (async () => {
        setPredictionPreferences({ ...values, isApproved });
        dispatch({
          type: SET_LOADING_FLAG,
          isLoading: true,
        });

        const predictedSpectra = Object.entries(values.spectra)
          .reduce<Array<string>>((acc, [key, value]) => {
            if (value) {
              acc.push(key);
            }
            return acc;
          }, [])
          .join(' , ');

        const hideLoading = await alert.showLoading(
          `Predict ${predictedSpectra} in progress`,
        );

        dispatch({
          type: PREDICT_SPECTRA,
          payload: { mol: molfile, options: values },
        });

        hideLoading();
        onClose();
      })();
    },
    [alert, dispatch, isApproved, molfile, onClose, setPredictionPreferences],
  );

  const approveCheckHandler = useCallback((e) => {
    setApproved(e.target.checked);
  }, []);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Prediction of NMR spectrum</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={refForm}
          initialValues={initValues}
          validationSchema={predictionFormValidation}
          onSubmit={submitHandler}
        >
          <FormikErrorsSummary />
          <div className="row margin-10">
            <span className="custom-label">Name :</span>
            <FormikInput
              name="name"
              style={{ input: { width: '200px', textAlign: 'left' } }}
            />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Spectrometer Frequency :</span>

            <FormikSelect
              data={FREQUENCIES}
              style={{ width: 290, height: 30, margin: 0 }}
              name="frequency"
            />
          </div>

          <span className="group-label">1D Options </span>

          <div className="row margin-10 padding-h-10">
            <IsotopesViewer value="1H" className="custom-label" />
            <Label title="From">
              <FormikInput name="1d.1H.from" type="number" />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="1d.1H.to" type="number" />
            </Label>
          </div>
          <div className="row margin-10 padding-h-10">
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
          <div className="row margin-10 padding-h-10">
            <span className="custom-label">Number of Points : </span>
            <FormikSelect
              data={NUMBER_OF_POINTS_1D}
              name="1d.nbPoints"
              style={{ width: 290, height: 30, margin: 0 }}
            />
          </div>
          <span className="group-label">2D Options </span>

          <div className="row margin-10 padding-h-10">
            <span className="custom-label">Number of Points : </span>
            <FormikSelect
              data={NUMBER_OF_POINTS_2D}
              name="2d.nbPoints.x"
              style={{ margin: 0, height: 30 }}
            />
            <span className="middle-x"> X </span>
            <FormikSelect
              data={NUMBER_OF_POINTS_2D}
              name="2d.nbPoints.y"
              style={{ margin: 0, height: 30 }}
            />
          </div>
          <div className="row margin-10">
            <span className="group-label">Spectra </span>
          </div>
          <div
            className="row margin-10 padding-h-10"
            style={{ justifyContent: 'space-between' }}
          >
            <div className="row">
              <FormikCheckBox name="spectra.proton" />
              <IsotopesViewer value="1H" className="nucleus-label" />
            </div>
            <div className="row">
              <FormikCheckBox name="spectra.carbon" />
              <IsotopesViewer value="13C" className="nucleus-label" />
            </div>
            <div className="row">
              <FormikCheckBox name="spectra.cosy" />
              <IsotopesViewer value="COSY" className="nucleus-label" />
            </div>
            <div className="row">
              <FormikCheckBox name="spectra.hsqc" />
              <IsotopesViewer value="HSQC" className="nucleus-label" />
            </div>
            <div className="row">
              <FormikCheckBox name="spectra.hmbc" />
              <IsotopesViewer value="HMBC" className="nucleus-label" />
            </div>
          </div>
        </FormikForm>
        <p className="warning">
          In order to predict spectra we are calling an external service and the
          chemical structure will leave your browser! You should never predict
          spectra for confidential molecules.
        </p>
        <div className="warning-container">
          <CheckBox
            onChange={approveCheckHandler}
            checked={isApproved}
            key={String(isApproved)}
          />
          <p>I confirm that the chemical structure is not confidential.</p>
        </div>
      </div>
      <div className="footer-container">
        <Button.Done onClick={handleSave} disabled={!isApproved}>
          Predict spectrum
        </Button.Done>
      </div>
    </div>
  );
}

export default PredictSpectraModal;

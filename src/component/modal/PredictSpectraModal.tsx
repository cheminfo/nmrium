/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef, useState, useMemo } from 'react';
import { Checkbox, CheckedState } from 'react-science/ui';

import {
  defaultPredictionOptions,
  predictSpectra,
} from '../../data/PredictionManager';
import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLogger } from '../context/LoggerContext';
import Button from '../elements/Button';
import CloseButton from '../elements/CloseButton';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import { positions } from '../elements/popup/options';
import PredictionPreferences from '../panels/predictionPanel/PredictionOptionsPanel';
import { useStateWithLocalStorage } from '../utility/LocalStorage';

import { ModalStyles } from './ModalStyle';

const styles = css`
  .inner-content {
    flex: 1;
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
`;

interface PredictSpectraModalProps {
  onClose?: (element?: string) => void;
  molecule: StateMoleculeExtended;
}

function PredictSpectraModal({
  onClose = () => null,
  molecule,
}: PredictSpectraModalProps) {
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [predictionPreferences, setPredictionPreferences] =
    useStateWithLocalStorage('nmrium-prediction-preferences');

  const { isApproved: isAgree = false, ...options } = predictionPreferences;
  const [isApproved, setApproved] = useState<CheckedState>(isAgree);
  const {
    toolOptions: {
      data: { predictionIndex },
    },
  } = useChartData();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const initValues = useMemo(() => {
    return Object.assign(defaultPredictionOptions, options, {
      name: `Prediction ${predictionIndex + 1}`,
    });
  }, [options, predictionIndex]);

  const { logger } = useLogger();
  const submitHandler = useCallback(
    (values) => {
      void (async () => {
        if (molecule) {
          const { molfile } = molecule;
          setPredictionPreferences({ ...values, isApproved });

          const predictedSpectra: string[] = [];
          for (const [key, value] of Object.entries(values.spectra)) {
            if (value) {
              predictedSpectra.push(key);
            }
          }

          const hideLoading = await alert.showLoading(
            `Predict ${predictedSpectra.join(',')} in progress`,
          );

          try {
            const data = await predictSpectra(molfile, logger);
            dispatch({
              type: 'PREDICT_SPECTRA',
              payload: {
                predictedSpectra: data.spectra,
                options: values,
                molecule,
              },
            });
          } catch (error: any) {
            alert.error(error?.message);
          } finally {
            hideLoading();
            onClose();
          }
        }
      })();
    },
    [
      alert,
      dispatch,
      isApproved,
      molecule,
      onClose,
      logger,
      setPredictionPreferences,
    ],
  );

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Prediction of NMR spectrum</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <PredictionPreferences
          onSubmit={submitHandler}
          options={initValues}
          ref={refForm}
        />
        <p className="warning">
          In order to predict spectra we are calling an external service and the
          chemical structure will leave your browser! You should never predict
          spectra for confidential molecules.
        </p>
        <div className="warning-container">
          <Checkbox
            onChange={setApproved}
            checked={isApproved}
            key={String(isApproved)}
            label="I confirm that the chemical structure is not confidential."
          />
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

export function usePredictSpectraModal() {
  const modal = useModal();
  return (molecule: StateMoleculeExtended) => {
    modal.show(<PredictSpectraModal molecule={molecule} />, {
      position: positions.TOP_CENTER,
      enableResizing: true,
      width: 600,
    });
  };
}

export default PredictSpectraModal;

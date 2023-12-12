/** @jsxImportSource @emotion/react */
import { Checkbox } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { SvgNmrFt } from 'cheminfo-font';
import { useCallback, useRef, useState, useMemo } from 'react';
import { Modal, useOnOff } from 'react-science/ui';

import {
  getDefaultPredictionOptions,
  predictSpectra,
} from '../../data/PredictionManager';
import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLogger } from '../context/LoggerContext';
import Button from '../elements/Button';
import { useAlert } from '../elements/popup/Alert';
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

  .header {
    padding: 0;
    margin: 0 30%;
    width: 40%;
  }
`;

interface PredictSpectraModalProps {
  onClose?: (element?: string) => void;
  molecule: StateMoleculeExtended;
}

export function PredictSpectraModal({
  onClose = () => null,
  molecule,
}: PredictSpectraModalProps) {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const refForm = useRef<any>();
  const dispatch = useDispatch();
  const alert = useAlert();
  const [predictionPreferences, setPredictionPreferences] =
    useStateWithLocalStorage('nmrium-prediction-preferences');

  const { isApproved: isAgree = false, ...options } = predictionPreferences;
  const [isApproved, setApproved] = useState<boolean>(isAgree);
  const {
    toolOptions: {
      data: { predictionIndex },
    },
  } = useChartData();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const initValues = useMemo(() => {
    return Object.assign(getDefaultPredictionOptions(), options, {
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

          onClose();
          closeDialog();

          const hideLoading = await alert.showLoading(
            `Predict ${predictedSpectra.join(',')} in progress`,
          );

          try {
            const data = await predictSpectra(molfile, values.spectra);
            dispatch({
              type: 'PREDICT_SPECTRA',
              payload: {
                logger,
                predictedSpectra: data.spectra,
                options: values,
                molecule,
              },
            });
          } catch (error: any) {
            alert.error(error?.message);
          } finally {
            hideLoading();
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
      closeDialog,
    ],
  );

  return (
    <>
      <Button.BarButton
        color={{ base: '#4e4e4e', hover: '#4e4e4e' }}
        onClick={openDialog}
        toolTip="Predict spectra"
        tooltipOrientation="horizontal"
      >
        <SvgNmrFt />
      </Button.BarButton>
      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={() => {
          onClose();
          closeDialog();
        }}
        width={600}
        maxWidth={1000}
      >
        <div css={[ModalStyles, styles]}>
          <Modal.Header>
            <div className="header handle">
              <span>Prediction of NMR spectrum</span>
            </div>
          </Modal.Header>
          <div className="inner-content">
            <PredictionPreferences
              onSubmit={submitHandler}
              options={initValues}
              ref={refForm}
            />
            <p className="warning">
              In order to predict spectra we are calling an external service and
              the chemical structure will leave your browser! You should never
              predict spectra for confidential molecules.
            </p>
            <div className="warning-container">
              <Checkbox
                onChange={(value) => setApproved(value.target.checked)}
                checked={isApproved}
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
      </Modal>
    </>
  );
}

export default PredictSpectraModal;

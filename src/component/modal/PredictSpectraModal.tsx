import { Checkbox, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { SvgNmrFt } from 'cheminfo-font';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Toolbar, useOnOff } from 'react-science/ui';

import {
  getDefaultPredictionOptions,
  predictSpectra,
} from '../../data/PredictionManager.js';
import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { useToaster } from '../context/ToasterContext.js';
import Button from '../elements/Button.js';
import { DialogBody as BaseDialogBody } from '../elements/DialogBody.js';
import type { SettingsRef } from '../panels/extra/utilities/settingImperativeHandle.js';
import PredictionPreferences from '../panels/predictionPanel/PredictionOptionsPanel.js';
import { useStateWithLocalStorage } from '../utility/LocalStorage.js';

const DialogBody = styled(BaseDialogBody)`
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
  const refForm = useRef<SettingsRef | null>(null);
  const dispatch = useDispatch();
  const toaster = useToaster();
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
    void refForm.current?.saveSetting();
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

          const hideLoading = toaster.showLoading({
            message: `Predict ${predictedSpectra.join(',')} in progress`,
          });

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
            toaster.show({ message: error?.message, intent: 'danger' });
          } finally {
            hideLoading();
          }
        }
      })();
    },
    [
      molecule,
      setPredictionPreferences,
      isApproved,
      onClose,
      closeDialog,
      toaster,
      dispatch,
      logger,
    ],
  );

  return (
    <>
      <Toolbar>
        <Toolbar.Item
          icon={<SvgNmrFt />}
          tooltip="Predict spectra"
          onClick={openDialog}
        />
      </Toolbar>
      <Dialog
        isOpen={isOpenDialog}
        onClose={() => {
          onClose();
          closeDialog();
        }}
        style={{ width: 600, maxWidth: 1000 }}
        title="Prediction of NMR spectrum"
      >
        <DialogBody>
          <PredictionPreferences
            onSave={submitHandler}
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
        </DialogBody>
        <DialogFooter className="footer-container">
          <Button.Done onClick={handleSave} disabled={!isApproved}>
            Predict spectrum
          </Button.Done>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default PredictSpectraModal;

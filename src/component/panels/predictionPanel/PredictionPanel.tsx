/** @jsxImportSource @emotion/react */
import OCL from 'openchemlib/full';
import { useCallback, useRef, useState } from 'react';
import { useAccordionContext } from 'react-science/ui';

import { predictSpectra } from '../../../data/PredictionManager';
import { StateMolecule } from '../../../data/molecules/Molecule';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import MoleculePanel from '../MoleculesPanel/MoleculePanel';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import PreferencesHeader from '../header/PreferencesHeader';

import PredictionPreferences from './PredictionPreferences';
import PredictionSimpleOptions from './PredictionSimpleOptions';

export default function PredictionPane() {
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const [molecule, setMolecule] = useState<Required<StateMolecule> | null>();
  const {
    view: { predictions },
  } = useChartData();
  const {
    item: spectraPanelState,
    utils: { toggle: openSpectraPanel },
  } = useAccordionContext('Spectra');
  const predictionPreferences = usePanelPreferences('prediction');

  const changeHandler = useCallback((molecule) => {
    const atoms = OCL.Molecule.fromMolfile(molecule?.molfile).getAllAtoms();
    if (atoms === 0) {
      setMolecule(null);
    } else {
      setMolecule(molecule);
    }
  }, []);
  const dispatch = useDispatch();
  const alert = useAlert();

  function predictHandler(action) {
    void (async () => {
      if (molecule) {
        const hideLoading = await alert.showLoading(
          `Predict 1H, 13C, COSY, HSQC, and HMBC in progress`,
        );

        const { molfile } = molecule;
        try {
          const data = await predictSpectra(molfile);
          dispatch({
            type: 'PREDICT_SPECTRA',
            payload: {
              predictedSpectra: data.spectra,
              options: predictionPreferences,
              molecule,
              action,
            },
          });
          if (!spectraPanelState?.isOpen) {
            openSpectraPanel();
          }
        } catch (error: any) {
          alert.error(error.message);
        } finally {
          hideLoading();
        }
      } else {
        alert.error('No Molecule selected');
      }
    })();
  }

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);
  const isPredictedBefore = !!(molecule?.id && predictions[molecule.id]);
  return (
    <div css={tablePanelStyle}>
      {isFlipped && (
        <>
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
          <div className="inner-container">
            <PredictionPreferences ref={settingRef} />
          </div>
        </>
      )}
      {!isFlipped && (
        <MoleculePanel
          onMoleculeChange={changeHandler}
          actionsOptions={{
            hidePredict: true,
            hideDelete: true,
            hideExport: true,
            showAboutPredict: true,
            renderAs: 'StructureEditor',
          }}
          floatMoleculeOnSave
          onClickPreferences={settingsPanelHandler}
          renderHeaderOptions={() => <PredictionSimpleOptions />}
        >
          <div style={{ display: 'flex', padding: '5px' }}>
            <Button.Done
              onClick={() => predictHandler('save')}
              disabled={!molecule}
            >
              {isPredictedBefore ? 'Replace prediction' : 'Predict spectra'}
            </Button.Done>
            {isPredictedBefore && (
              <Button.Action
                style={{ marginLeft: '5px' }}
                onClick={() => predictHandler('add')}
              >
                Add prediction
              </Button.Action>
            )}
          </div>
        </MoleculePanel>
      )}
    </div>
  );
}

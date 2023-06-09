import { useState, useCallback } from 'react';
import { useAccordionContext } from 'react-science/ui';

import { predictSpectra } from '../../../data/PredictionManager';
import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import MoleculePanel from '../MoleculesPanel/MoleculePanel';

import PredictionPreferences from './PredictionOptions';

export default function PredictionPane() {
  const [molecule, setMolecule] = useState<StateMoleculeExtended | null>();
  const { molecules } = useChartData();
  const {
    item: spectraPanelState,
    utils: { toggle: openSpectraPanel },
  } = useAccordionContext('Spectra');

  const changeHandler = useCallback((molecule) => {
    setMolecule(molecule);
  }, []);
  const dispatch = useDispatch();
  const alert = useAlert();

  const predictHandler = (values) => {
    void (async () => {
      if (molecule) {
        dispatch({
          type: 'SET_LOADING_FLAG',
          payload: { isLoading: true },
        });

        const hideLoading = await alert.showLoading(
          `Predict 1H, 13C, COSY, HSQC, and HMBC in progress`,
        );
        try {
          const data = await predictSpectra(molecule.molfile);
          dispatch({
            type: 'PREDICT_SPECTRA',
            payload: { predictedSpectra: data.spectra, options: values },
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
  };

  return (
    <MoleculePanel
      onMoleculeChange={changeHandler}
      actionsOptions={{
        hidePredict: true,
        hideDelete: true,
        hideExport: true,
        showAboutPredict: true,
      }}
      emptyTextStyle={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.2rem',
        backgroundColor: '#2dd36f',
        color: 'white',
      }}
    >
      <PredictionPreferences
        onPredict={predictHandler}
        disabled={!molecules || molecules.length === 0}
      />
    </MoleculePanel>
  );
}

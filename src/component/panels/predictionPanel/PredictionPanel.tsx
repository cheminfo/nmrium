import OCL from 'openchemlib/full';
import { useCallback, useState } from 'react';
import { useAccordionContext } from 'react-science/ui';

import { predictSpectra } from '../../../data/PredictionManager';
import { StateMolecule } from '../../../data/molecules/Molecule';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import MoleculePanel from '../MoleculesPanel/MoleculePanel';

import PredictionPreferences, { OnPredict } from './PredictionOptions';

export default function PredictionPane() {
  const [molecule, setMolecule] = useState<Required<StateMolecule> | null>();
  const {
    view: { predictions },
  } = useChartData();
  const {
    item: spectraPanelState,
    utils: { toggle: openSpectraPanel },
  } = useAccordionContext('Spectra');

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

  const predictHandler: OnPredict = (values, action) => {
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
              options: values,
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
  };

  return (
    <MoleculePanel
      onMoleculeChange={changeHandler}
      actionsOptions={{
        hidePredict: true,
        hideDelete: true,
        hideExport: true,
        showAboutPredict: true,
        renderAs: 'StructureEditor',
      }}
      emptyTextStyle={{
        padding: '0.25rem 0.5rem',
        borderRadius: '0.2rem',
        backgroundColor: '#2dd36f',
        color: 'white',
      }}
      floatMoleculeOnSave
    >
      <PredictionPreferences
        onPredict={predictHandler}
        disabled={!molecule}
        isPredictedBefore={!!(molecule?.id && predictions[molecule.id])}
      />
    </MoleculePanel>
  );
}

import { Draft } from 'immer';
import { signalsToXY } from 'nmr-processing';
import { generateSpectrum2D } from 'spectrum-generator';

import {
  Datum1D,
  generated1DSpectrum,
  initiateDatum1D,
  mapRanges,
  updateIntegralRanges,
} from '../../../data/data1d/Spectrum1D';
import {
  Datum2D,
  generated2DSpectrum,
  initiateDatum2D,
} from '../../../data/data2d/Spectrum2D';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { handleUnlinkZone } from './ZonesActions';

function addMoleculeHandler(draft: Draft<State>, molfile) {
  MoleculeManager.addMolfile(draft.molecules, molfile);
}

function setMoleculeHandler(draft: Draft<State>, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);
}

function deleteMoleculeHandler(draft: Draft<State>, action) {
  const { key, assignmentData } = action.payload;
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    handleUnlinkRange(draft, { payload: { assignmentData, rangeData: null } });
  }
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    handleUnlinkZone(draft, { payload: { assignmentData, zoneData: null } });
  }
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );

  draft.molecules.splice(moleculeIndex, 1);
}

function predictSpectraFromMoleculeHandler(draft: Draft<State>, action) {
  const { data, options, usedColors } = action.payload;

  if (!data) {
    draft.isLoading = false;
  } else {
    let datum: Datum1D | Datum2D | null = null;

    for (const predictedDatum of data) {
      for (const key in predictedDatum) {
        if (options.spectra[key]) {
          const spectrum = predictedDatum[key];
          switch (key) {
            case 'proton':
            case 'carbon':
              datum = generated1DSpectrum({
                spectrum,
                options,
                usedColors,
              });

              break;

            case 'cosy':
            case 'hsqc':
            case 'hmbc':
              datum = generated2DSpectrum({
                spectrum,
                options,
                usedColors,
              });
              break;
            default:
              break;
          }
          if (datum) {
            draft.data.push(datum);
            draft.tabActiveSpectrum[spectrum.nucleus] = {
              id: datum.id,
              index: draft.data.length - 1,
            };
          }
        }
      }
    }

    setActiveTab(draft);
    draft.isLoading = false;
  }
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMoleculeHandler,
};

import { Draft } from 'immer';
import { signalsToXY } from 'nmr-processing';

import {
  initiateDatum1D,
  mapRanges,
  updateIntegralRanges,
} from '../../../data/data1d/Spectrum1D';
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
    for (const predictedDatum of data) {
      for (const key in predictedDatum) {
        if (['proton', 'carbon'].includes(key) && options.spectra[key]) {
          const { signals, ranges, nucleus } = predictedDatum[key];
          const { x, y } = signalsToXY(signals, {
            ...options[nucleus],
          });
          const datum = initiateDatum1D(
            {
              data: { x, im: null, re: y },
              info: { nucleus },
            },
            usedColors,
          );
          datum.ranges.values = mapRanges(ranges, datum);
          updateIntegralRanges(datum);
          draft.data.push(datum);

          draft.tabActiveSpectrum[nucleus] = {
            id: datum.id,
            index: draft.data.length - 1,
          };
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

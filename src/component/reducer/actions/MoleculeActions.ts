import { Draft } from 'immer';

import { generateSpectra } from '../../../data/PredictionManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import nucleusToString from '../../utility/nucleusToString';
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
  const { data, options } = action.payload;
  if (!data) {
    draft.isLoading = false;
  } else {
    for (const spectrum of generateSpectra(data, options, draft.usedColors)) {
      draft.data.push(spectrum);
      draft.tabActiveSpectrum[nucleusToString(spectrum.info.nucleus)] = {
        id: spectrum.id,
        index: draft.data.length - 1,
      };
    }
  }

  setActiveTab(draft);
  draft.isLoading = false;
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMoleculeHandler,
};

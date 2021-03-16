import { Draft } from 'immer';
import { signalsToXY } from 'nmr-processing';

import { initiateDatum1D } from '../../../data/data1d/Datum1D';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { handleUnlinkZone } from './ZonesActions';
import { initZoom1DHandler, setZoom } from './Zoom';

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

function predictSpectraFromMolculeHandler(draft: Draft<State>, action) {
  const { fromMolfile, options } = action.payload;
  const { x, y } = signalsToXY(fromMolfile.signals, {});
  let id: any = null;
  if (options.spectra['1h']) {
    const datum = initiateDatum1D({
      data: { x, im: null, re: y },
      info: { nucleus: '1H' },
    });
    draft.data.push(datum);
    id = datum.id;
    draft.activeSpectrum = null;
    draft.tabActiveSpectrum['1H'] = null;
  }
  setActiveTab(draft);
  initZoom1DHandler(draft.data);
  setZoom(draft, 0.9, id);

  draft.isLoading = false;
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMolculeHandler,
};

import { Draft } from 'immer';

import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { handleUnlinkZone } from './ZonesActions';

function handleAddMolecule(draft: Draft<State>, molfile) {
  MoleculeManager.addMolfile(draft.molecules, molfile);
}

function handleSetMolecule(draft: Draft<State>, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);
}

function handleDeleteMolecule(draft: Draft<State>, action) {
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

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

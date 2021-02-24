import { Draft } from 'immer';

import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { State } from '../Reducer';

function handleAddMolecule(draft: Draft<State>, molfile) {
  MoleculeManager.addMolfile(draft.molecules, molfile);
}

function handleSetMolecule(draft: Draft<State>, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);
}

function handleDeleteMolecule(draft: Draft<State>, key) {
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );

  draft.molecules.splice(moleculeIndex, 1);
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

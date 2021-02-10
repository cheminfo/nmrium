import * as MoleculeManager from '../../../data/molecules/MoleculeManager';

function handleAddMolecule(draft, molfile) {
  MoleculeManager.addMolfile(draft.molecules, molfile);
}

function handleSetMolecule(draft, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);
}

function handleDeleteMolecule(draft, key) {
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );

  draft.molecules.splice(moleculeIndex, 1);
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

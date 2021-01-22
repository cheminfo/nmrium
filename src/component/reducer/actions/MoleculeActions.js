import { produce } from 'immer';

import { AnalysisObj } from '../core/Analysis';

function handleAddMolecule(state, molfile) {
  AnalysisObj.addMolfile(molfile);
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.getMolecules();
  });
}

function handleSetMolecule(state, molfile, key) {
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.setMolfile(molfile, key);
  });
}

function handleDeleteMolecule(state, key) {
  return produce(state, (draft) => {
    AnalysisObj.removeMolecule(key);
    draft.molecules = AnalysisObj.getMolecules();
  });
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

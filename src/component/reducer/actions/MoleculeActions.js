import { produce } from 'immer';

import { AnalysisObj } from '../core/Analysis';

const handleAddMolecule = (state, molfile) => {
  AnalysisObj.addMolfile(molfile);
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.getMolecules();
  });
};

const handleSetMolecule = (state, molfile, key) => {
  return produce(state, (draft) => {
    draft.molecules = AnalysisObj.setMolfile(molfile, key);
  });
};

const handleDeleteMolecule = (state, key) => {
  return produce(state, (draft) => {
    AnalysisObj.removeMolecule(key);
    draft.molecules = AnalysisObj.getMolecules();
  });
};

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

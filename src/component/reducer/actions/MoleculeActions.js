import { AnalysisObj } from '../core/Analysis';

function handleAddMolecule(draft, molfile) {
  AnalysisObj.addMolfile(molfile);
  draft.molecules = AnalysisObj.getMolecules();
}

function handleSetMolecule(draft, molfile, key) {
  draft.molecules = AnalysisObj.setMolfile(molfile, key);
}

function handleDeleteMolecule(draft, key) {
  AnalysisObj.removeMolecule(key);
  draft.molecules = AnalysisObj.getMolecules();
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

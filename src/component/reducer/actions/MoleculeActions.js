function handleAddMolecule(draft, molfile) {
  draft.AnalysisObj.addMolfile(molfile);
  draft.molecules = draft.AnalysisObj.getMolecules();
}

function handleSetMolecule(draft, molfile, key) {
  draft.molecules = draft.AnalysisObj.setMolfile(molfile, key);
}

function handleDeleteMolecule(draft, key) {
  draft.AnalysisObj.removeMolecule(key);
  draft.molecules = draft.AnalysisObj.getMolecules();
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };

function handleSetMF(draft, mf) {
  draft.correlationObj.setMF(mf);
  draft.correlations = draft.correlationObj.getData();
}

function handleUnsetMF(draft) {
  draft.correlationObj.unsetMF();
  draft.correlations = draft.correlationObj.getData();
}

function handleSetTolerance(draft, tolerance) {
  draft.correlationObj.setTolerance(tolerance);
  draft.correlations = draft.correlationObj.getData();
}

function handleUpdateCorrelations(draft, spectra) {
  draft.correlationObj.setSpectra(spectra);
  draft.correlations = draft.correlationObj.getData();
}

function handleAddCorrelation(draft, correlation) {
  draft.correlationObj.addCorrelation(correlation);
  draft.correlations = draft.correlationObj.getData();
}

function handleDeleteCorrelation(draft, id) {
  draft.correlationObj.deleteCorrelation(id);
  draft.correlations = draft.correlationObj.getData();
}

function handleSetCorrelation(draft, id, correlation) {
  draft.correlationObj.setCorrelation(id, correlation);
  draft.correlations = draft.correlationObj.getData();
}

function handleSetCorrelations(draft, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) =>
      draft.correlationObj.setCorrelation(id, correlations[i]),
    );
    draft.correlations = draft.correlationObj.getData();
  }
}

export {
  handleAddCorrelation,
  handleUpdateCorrelations,
  handleDeleteCorrelation,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleUnsetMF,
  handleSetTolerance,
};

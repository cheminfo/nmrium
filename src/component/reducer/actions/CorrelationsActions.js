function handleSetMF(draft, mf) {
  draft.CorrelationObj.setMF(mf);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleUnsetMF(draft) {
  draft.CorrelationObj.unsetMF();
  draft.correlations = draft.CorrelationObj.getData();
}

function handleSetTolerance(draft, tolerance) {
  draft.CorrelationObj.setTolerance(tolerance);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleUpdateCorrelations(draft, spectra) {
  draft.CorrelationObj.setSpectra(spectra);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleAddCorrelation(draft, correlation) {
  draft.CorrelationObj.addCorrelation(correlation);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleDeleteCorrelation(draft, id) {
  draft.CorrelationObj.deleteCorrelation(id);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleSetCorrelation(draft, id, correlation) {
  draft.CorrelationObj.updateCorrelation(id, correlation);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleSetCorrelations(draft, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) =>
      draft.CorrelationObj.updateCorrelation(id, correlations[i]),
    );
    draft.correlations = draft.CorrelationObj.getData();
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

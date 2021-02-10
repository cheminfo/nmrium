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

function handleUpdateCorrelations(draft, signals1D, signals2D, signalsDEPT) {
  draft.CorrelationObj.updateValues(signals1D, signals2D, signalsDEPT);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleAddCorrelation(draft, correlation) {
  draft.CorrelationObj.addValue(correlation);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleDeleteCorrelation(draft, id) {
  draft.CorrelationObj.deleteValue(id);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleSetCorrelation(draft, id, correlation) {
  draft.CorrelationObj.setValue(id, correlation);
  draft.correlations = draft.CorrelationObj.getData();
}

function handleSetCorrelations(draft, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) => draft.CorrelationObj.setValue(id, correlations[i]));
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

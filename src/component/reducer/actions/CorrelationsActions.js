function handleSetMF(draft, mf) {
  draft.AnalysisObj.getCorrelationManagerInstance().setMF(mf);
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleUnsetMF(draft) {
  draft.AnalysisObj.getCorrelationManagerInstance().unsetMF();
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleSetTolerance(draft, tolerance) {
  draft.AnalysisObj.getCorrelationManagerInstance().setTolerance(tolerance);
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleUpdateCorrelations(draft, signals1D, signals2D, signalsDEPT) {
  draft.AnalysisObj.getCorrelationManagerInstance().updateValues(
    signals1D,
    signals2D,
    signalsDEPT,
  );
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleAddCorrelation(draft, correlation) {
  draft.AnalysisObj.getCorrelationManagerInstance().addValue(correlation);
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleDeleteCorrelation(draft, id) {
  draft.AnalysisObj.getCorrelationManagerInstance().deleteValue(id);
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleSetCorrelation(draft, id, correlation) {
  draft.AnalysisObj.getCorrelationManagerInstance().setValue(id, correlation);
  draft.correlations = draft.AnalysisObj.getCorrelations();
}

function handleSetCorrelations(draft, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) =>
      draft.AnalysisObj.getCorrelationManagerInstance().setValue(
        id,
        correlations[i],
      ),
    );
    draft.correlations = draft.AnalysisObj.getCorrelations();
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

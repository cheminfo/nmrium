import { AnalysisObj } from '../core/Analysis';

function handleSetMF(draft, mf) {
  AnalysisObj.getCorrelationManagerInstance().setMF(mf);
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleUnsetMF(draft) {
  AnalysisObj.getCorrelationManagerInstance().unsetMF();
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleSetTolerance(draft, tolerance) {
  AnalysisObj.getCorrelationManagerInstance().setTolerance(tolerance);
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleUpdateCorrelations(draft, signals1D, signals2D, signalsDEPT) {
  AnalysisObj.getCorrelationManagerInstance().updateValues(
    signals1D,
    signals2D,
    signalsDEPT,
  );
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleAddCorrelation(draft, correlation) {
  AnalysisObj.getCorrelationManagerInstance().addValue(correlation);
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleDeleteCorrelation(draft, id) {
  AnalysisObj.getCorrelationManagerInstance().deleteValue(id);
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleSetCorrelation(draft, id, correlation) {
  AnalysisObj.getCorrelationManagerInstance().setValue(id, correlation);
  draft.correlations = AnalysisObj.getCorrelations();
}

function handleSetCorrelations(draft, ids, correlations) {
  if (ids.length === correlations.length) {
    ids.forEach((id, i) =>
      AnalysisObj.getCorrelationManagerInstance().setValue(id, correlations[i]),
    );
    draft.correlations = AnalysisObj.getCorrelations();
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

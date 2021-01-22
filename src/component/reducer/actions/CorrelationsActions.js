import { produce } from 'immer';

import { AnalysisObj } from '../core/Analysis';

function handleSetMF(state, mf) {
  AnalysisObj.getCorrelationManagerInstance().setMF(mf);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleUnsetMF(state) {
  AnalysisObj.getCorrelationManagerInstance().unsetMF();
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleSetTolerance(state, tolerance) {
  AnalysisObj.getCorrelationManagerInstance().setTolerance(tolerance);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleUpdateCorrelations(state, signals1D, signals2D, signalsDEPT) {
  AnalysisObj.getCorrelationManagerInstance().updateValues(
    signals1D,
    signals2D,
    signalsDEPT,
  );
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleAddCorrelation(state, correlation) {
  AnalysisObj.getCorrelationManagerInstance().addValue(correlation);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleDeleteCorrelation(state, id) {
  AnalysisObj.getCorrelationManagerInstance().deleteValue(id);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleSetCorrelation(state, id, correlation) {
  return produce(state, (draft) => {
    AnalysisObj.getCorrelationManagerInstance().setValue(id, correlation);
    draft.correlations = AnalysisObj.getCorrelations();
  });
}

function handleSetCorrelations(state, ids, correlations) {
  if (ids.length === correlations.length) {
    return produce(state, (draft) => {
      ids.forEach((id, i) =>
        AnalysisObj.getCorrelationManagerInstance().setValue(
          id,
          correlations[i],
        ),
      );
      draft.correlations = AnalysisObj.getCorrelations();
    });
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

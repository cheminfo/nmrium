import { produce } from 'immer';

import { AnalysisObj } from '../core/Analysis';

const handleSetMF = (state, mf) => {
  AnalysisObj.getCorrelationManagerInstance().setMF(mf);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleUnsetMF = (state) => {
  AnalysisObj.getCorrelationManagerInstance().unsetMF();
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleSetTolerance = (state, tolerance) => {
  AnalysisObj.getCorrelationManagerInstance().setTolerance(tolerance);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleUpdateCorrelations = (state, signals1D, signals2D, signalsDEPT) => {
  AnalysisObj.getCorrelationManagerInstance().updateValues(
    signals1D,
    signals2D,
    signalsDEPT,
  );
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleAddCorrelation = (state, correlation) => {
  AnalysisObj.getCorrelationManagerInstance().addValue(correlation);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleDeleteCorrelation = (state, id) => {
  AnalysisObj.getCorrelationManagerInstance().deleteValue(id);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleSetCorrelation = (state, id, correlation) => {
  return produce(state, (draft) => {
    AnalysisObj.getCorrelationManagerInstance().setValue(id, correlation);
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleSetCorrelations = (state, correlations) => {
  return produce(state, (draft) => {
    AnalysisObj.getCorrelationManagerInstance().setValues(correlations);
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

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

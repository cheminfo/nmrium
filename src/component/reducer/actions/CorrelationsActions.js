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

const handleUnsetTolerance = (state) => {
  AnalysisObj.getCorrelationManagerInstance().unsetTolerance();
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

const handleBuildCorrelations = (state, signals1D, signals2D) => {
  AnalysisObj.getCorrelationManagerInstance().buildValues(signals1D, signals2D);
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
  handleBuildCorrelations,
  handleDeleteCorrelation,
  handleSetCorrelation,
  handleSetCorrelations,
  handleSetMF,
  handleUnsetMF,
  handleSetTolerance,
  handleUnsetTolerance,
};

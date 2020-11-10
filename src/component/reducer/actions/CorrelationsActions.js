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

// const handleAddCorrelation = (state, correlation) => {
//   AnalysisObj.getCorrelationManagerInstance().addValue(correlation);
//   return produce(state, (draft) => {
//     draft.correlations = AnalysisObj.getCorrelations();
//   });
// };

const handleAddCorrelations = (state, correlations) => {
  AnalysisObj.getCorrelationManagerInstance().addValues(correlations);
  return produce(state, (draft) => {
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

// const handleDeleteCorrelation = (state, id) => {
//   return produce(state, (draft) => {
//     AnalysisObj.getCorrelationManagerInstance().deleteValue(id);
//     draft.correlations = AnalysisObj.getCorrelations();
//   });
// };

const handleDeleteCorrelations = (state) => {
  return produce(state, (draft) => {
    AnalysisObj.getCorrelationManagerInstance().deleteValues();
    draft.correlations = AnalysisObj.getCorrelations();
  });
};

// const handleSetCorrelation = (state, id, correlation) => {
//   return produce(state, (draft) => {
//     draft.correlations = AnalysisObj.getCorrelationManagerInstance().setValue(
//       id,
//       correlation,
//     );
//   });
// };

// const handleSetCorrelations = (state, correlations) => {
//   return produce(state, (draft) => {
//     draft.correlations = AnalysisObj.getCorrelationManagerInstance().setValues(
//       correlations,
//     );
//   });
// };

export {
  // handleAddCorrelation,
  handleAddCorrelations,
  // handleDeleteCorrelation,
  handleDeleteCorrelations,
  // handleSetCorrelation,
  // handleSetCorrelations,
  handleSetMF,
  handleUnsetMF,
  handleSetTolerance,
  handleUnsetTolerance,
};

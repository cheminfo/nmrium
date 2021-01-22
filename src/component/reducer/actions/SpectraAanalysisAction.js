import { produce } from 'immer';

import { getXScale } from '../../1d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

function analyzeSpectra(state, action) {
  const scaleX = getXScale(state);
  const start = scaleX.invert(action.startX);
  const end = scaleX.invert(action.endX);
  let range = [];
  if (start > end) {
    range = [end, start];
  } else {
    range = [start, end];
  }
  const { activeTab } = state;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().analyzeSpectra(
    range[0],
    range[1],
    activeTab,
  );
  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
}

function handleDeleteSpectraRanges(state, action) {
  const { colKey } = action;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().deleteSpectraAnalysis(
    colKey,
    state.activeTab,
  );

  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
}
function handleResizeSpectraRange(state, action) {
  const { colKey, from, to } = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().analyzeSpectra(
    from,
    to,
    state.activeTab,
    colKey,
  );

  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
}
function handleSetcolumns(state, action) {
  const data = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().setColumn(
    state.activeTab,
    data,
  );
  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
}
function handleFiltercolumn(state, action) {
  const { columnKey, valueKey } = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().changeColumnValueKey(
    state.activeTab,
    columnKey,
    valueKey,
  );
  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
}

export {
  analyzeSpectra,
  handleDeleteSpectraRanges,
  handleResizeSpectraRange,
  handleSetcolumns,
  handleFiltercolumn,
};

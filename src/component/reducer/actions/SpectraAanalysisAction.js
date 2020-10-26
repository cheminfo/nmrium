import { produce } from 'immer';

import { getXScale } from '../../1d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

const analyzeSpectra = (state, action) => {
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
};

const handleDeleteSpectraRanges = (state, action) => {
  const {
    range: { from, to },
  } = action;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().deleteSpectraAnalysis(
    `${from}-${to}`,
    state.activeTab,
  );

  return produce(state, (draft) => {
    draft.spectraAanalysis = spectraAanalysis;
  });
};

export { analyzeSpectra, handleDeleteSpectraRanges };

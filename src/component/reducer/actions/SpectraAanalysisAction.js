import { getXScale } from '../../1d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

function analyzeSpectra(draft, action) {
  const scaleX = getXScale(draft);
  const start = scaleX.invert(action.startX);
  const end = scaleX.invert(action.endX);
  let range = [];
  if (start > end) {
    range = [end, start];
  } else {
    range = [start, end];
  }
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().analyzeSpectra(
    range[0],
    range[1],
    draft.activeTab,
  );
  draft.spectraAanalysis = spectraAanalysis;
}

function handleDeleteSpectraRanges(draft, action) {
  const { colKey } = action;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().deleteSpectraAnalysis(
    colKey,
    draft.activeTab,
  );

  draft.spectraAanalysis = spectraAanalysis;
}
function handleResizeSpectraRange(draft, action) {
  const { colKey, from, to } = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().analyzeSpectra(
    from,
    to,
    draft.activeTab,
    colKey,
  );

  draft.spectraAanalysis = spectraAanalysis;
}
function handleSetcolumns(draft, action) {
  const data = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().setColumn(
    draft.activeTab,
    data,
  );
  draft.spectraAanalysis = spectraAanalysis;
}
function handleFiltercolumn(draft, action) {
  const { columnKey, valueKey } = action.payload;
  const spectraAanalysis = AnalysisObj.getMultipleAnalysisInstance().changeColumnValueKey(
    draft.activeTab,
    columnKey,
    valueKey,
  );
  draft.spectraAanalysis = spectraAanalysis;
}

export {
  analyzeSpectra,
  handleDeleteSpectraRanges,
  handleResizeSpectraRange,
  handleSetcolumns,
  handleFiltercolumn,
};

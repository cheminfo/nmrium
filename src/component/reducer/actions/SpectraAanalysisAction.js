import * as MulitpleAnalysis from '../../../data/data1d/MulitpleAnalysis';
import getRange from '../helper/getRange';

function analyzeSpectra(draft, action) {
  const [from, to] = getRange(draft, action);
  MulitpleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.activeTab,
  });
}

function handleDeleteSpectraRanges(draft, action) {
  const { colKey } = action;
  MulitpleAnalysis.deleteSpectraAnalysis(
    draft.spectraAnalysis,
    colKey,
    draft.activeTab,
  );
}
function handleResizeSpectraRange(draft, action) {
  const { colKey: columnKey, from, to } = action.payload;
  MulitpleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.activeTab,
    columnKey,
  });
}
function handleSetcolumns(draft, action) {
  const data = action.payload;
  MulitpleAnalysis.setColumn(draft.spectraAnalysis, draft.activeTab, data);
}
function handleFiltercolumn(draft, action) {
  const { columnKey, valueKey } = action.payload;
  MulitpleAnalysis.changeColumnValueKey(
    draft.spectraAnalysis,
    draft.activeTab,
    columnKey,
    valueKey,
  );
}

export {
  analyzeSpectra,
  handleDeleteSpectraRanges,
  handleResizeSpectraRange,
  handleSetcolumns,
  handleFiltercolumn,
};

import { Draft } from 'immer';

import * as MulitpleAnalysis from '../../../data/data1d/MulitpleAnalysis';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

function analyzeSpectra(draft: Draft<State>, action) {
  const [from, to] = getRange(draft, action);
  MulitpleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.activeTab,
  });
}

function handleDeleteSpectraRanges(draft: Draft<State>, action) {
  const { colKey } = action;
  MulitpleAnalysis.deleteSpectraAnalysis(
    draft.spectraAnalysis,
    colKey,
    draft.activeTab,
  );
}
function handleResizeSpectraRange(draft: Draft<State>, action) {
  const { columnKey, from, to } = action.payload;
  MulitpleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.activeTab,
    columnKey,
  });
}
function handleSetcolumns(draft: Draft<State>, action) {
  const data = action.payload;
  MulitpleAnalysis.setColumn(draft.spectraAnalysis, draft.activeTab, data);
}
function handleFiltercolumn(draft: Draft<State>, action) {
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

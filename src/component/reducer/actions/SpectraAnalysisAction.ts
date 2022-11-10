import { Draft } from 'immer';

import * as MultipleAnalysis from '../../../data/data1d/MultipleAnalysis';
import { Datum1D } from '../../../data/types/data1d';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

function analyzeSpectra(draft: Draft<State>, action) {
  const [from, to] = getRange(draft, action);
  MultipleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.view.spectra.activeTab,
  });
}

function handleDeleteSpectraRanges(draft: Draft<State>, action) {
  const { colKey } = action;

  MultipleAnalysis.deleteSpectraAnalysis(
    draft.spectraAnalysis,
    colKey,
    draft.view.spectra.activeTab,
  );
}
function handleResizeSpectraRange(draft: Draft<State>, action) {
  const { columnKey, from, to } = action.payload;
  MultipleAnalysis.analyzeSpectra(draft.data, draft.spectraAnalysis, {
    from,
    to,
    nucleus: draft.view.spectra.activeTab,
    columnKey,
  });
}
function handleSetColumns(draft: Draft<State>, action) {
  const data = action.payload;

  MultipleAnalysis.setColumn(
    draft.spectraAnalysis,
    draft.view.spectra.activeTab,
    data,
  );
}
function handleFilterColumn(draft: Draft<State>, action) {
  const { columnKey, valueKey } = action.payload;

  MultipleAnalysis.changeColumnValueKey(
    draft.spectraAnalysis,
    draft.view.spectra.activeTab,
    columnKey,
    valueKey,
  );
}
function handleOrderSpectra(draft: Draft<State>, action) {
  const { data } = action.payload;
  const spectraIndexes = {};
  let index = 0;
  for (const spectrum of draft.data) {
    spectraIndexes[spectrum.id] = index;
    index++;
  }
  const sortedSpectraKey = {};
  const sortedSpectra: Datum1D[] = [];

  for (const record of data) {
    const key = Object.keys(record)[0];
    const spectrumId = record[key].SID;
    sortedSpectraKey[spectrumId] = true;
    sortedSpectra.push(draft.data[spectraIndexes[spectrumId]] as Datum1D);
  }
  draft.data = draft.data
    .filter((s) => !sortedSpectraKey[s.id])
    .concat(sortedSpectra);
}

export {
  analyzeSpectra,
  handleDeleteSpectraRanges,
  handleResizeSpectraRange,
  handleSetColumns,
  handleFilterColumn,
  handleOrderSpectra,
};

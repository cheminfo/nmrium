import { Draft } from 'immer';
import { Spectrum1D } from 'nmr-load-save';

import { AnalysisRow } from '../../../data/data1d/multipleSpectraAnalysis';
import { State } from '../Reducer';
import { ActionType } from '../types/ActionType';

type OrderSpectraAction = ActionType<
  'ORDER_MULTIPLE_SPECTRA_ANALYSIS',
  {
    data: AnalysisRow[];
  }
>;

export type SpectraAnalysisActions = OrderSpectraAction;

function handleOrderSpectra(draft: Draft<State>, action: OrderSpectraAction) {
  const { data } = action.payload;
  const spectraIndexes = {};
  let index = 0;
  for (const spectrum of draft.data) {
    spectraIndexes[spectrum.id] = index;
    index++;
  }
  const sortedSpectraKey = {};
  const sortedSpectra: Spectrum1D[] = [];

  for (const record of data) {
    const key = Object.keys(record)[0];
    const spectrumId = record[key].SID;
    sortedSpectraKey[spectrumId] = true;
    sortedSpectra.push(draft.data[spectraIndexes[spectrumId]] as Spectrum1D);
  }
  draft.data = draft.data
    .filter((s) => !sortedSpectraKey[s.id])
    .concat(sortedSpectra);
}

export { handleOrderSpectra };

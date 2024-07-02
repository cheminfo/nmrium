import { Draft } from 'immer';
import { Spectrum1D } from 'nmr-load-save';
import { NMRRange } from 'nmr-processing';

import { get1DColor, mapRanges } from '../../../data/data1d/Spectrum1D';
import {
  ResurrectSpectrumInfo,
  generateSpectrumFromRanges,
} from '../../../data/data1d/Spectrum1D/ranges/generateSpectrumFromRanges';
import { State } from '../Reducer';
import { setZoom } from '../helper/Zoom1DManager';
import zoomHistoryManager from '../helper/ZoomHistoryManager';
import { ActionType } from '../types/ActionType';

import { setDomain } from './DomainActions';

type ResurrectSpectrumFromJcampAction = ActionType<
  'RESURRECTING_SPECTRUM_FROM_JCAMP',
  { ranges: NMRRange[]; spectrum: Spectrum1D }
>;
type ResurrectSpectrumFromRangesAction = ActionType<
  'RESURRECTING_SPECTRUM_FROM_RANGES',
  { ranges: NMRRange[]; info: ResurrectSpectrumInfo }
>;

export type DatabaseActions =
  | ActionType<'TOGGLE_SIMILARITY_TREE'>
  | ResurrectSpectrumFromJcampAction
  | ResurrectSpectrumFromRangesAction;

function handleResurrectSpectrumFromJcamp(
  draft: Draft<State>,
  action: ResurrectSpectrumFromJcampAction,
) {
  const { ranges } = action.payload;
  let { spectrum } = action.payload;
  spectrum = {
    ...spectrum,
    ranges: {
      ...spectrum.ranges,
      values: mapRanges(ranges, spectrum),
    },
    display: {
      ...spectrum.display,
      ...get1DColor(spectrum.display, { usedColors: draft.usedColors }),
    },
  };

  draft.data.push(spectrum);

  setDomain(draft, { isYDomainShared: false });

  //rescale the vertical zoom
  setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });

  //keep the last horizontal zoom
  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
}

function handleResurrectSpectrumFromRanges(
  draft: Draft<State>,
  action: ResurrectSpectrumFromRangesAction,
) {
  const { ranges, info } = action.payload;
  const datum = generateSpectrumFromRanges(ranges, info, draft.usedColors);
  if (!datum) return;

  draft.data.push(datum);
  setDomain(draft, { isYDomainShared: false });
  //rescale the vertical zoom
  setZoom(draft, { scale: 0.8, spectrumID: datum.id });

  //keep the last horizontal zoom
  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );
  const zoomValue = zoomHistory.getLast();
  if (zoomValue) {
    draft.xDomain = zoomValue.xDomain;
    draft.yDomain = zoomValue.yDomain;
  }
}

function handleToggleSimilarityTree(draft: Draft<State>) {
  draft.view.spectra.showSimilarityTree =
    !draft.view.spectra.showSimilarityTree;
}

export {
  handleResurrectSpectrumFromRanges,
  handleResurrectSpectrumFromJcamp,
  handleToggleSimilarityTree,
};

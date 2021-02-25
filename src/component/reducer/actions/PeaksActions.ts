import { Draft, original } from 'immer';

import { lookupPeak, Datum1D } from '../../../data/data1d/Datum1D';
import autoPeakPicking from '../../../data/data1d/autoPeakPicking';
import generateID from '../../../data/utilities/generateID';
import { options } from '../../toolbar/ToolTypes';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

// import { AnalysisObj } from '../core/Analysis';

function addPeak(draft: Draft<State>, mouseCoordinates) {
  const state = original(draft) as State;
  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const xShift = 10;
    const startX = mouseCoordinates.x - xShift;
    const endX = mouseCoordinates.x + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = lookupPeak(state.data[index].data, { from, to });
    if (candidatePeak) {
      const peak = { id: generateID(), ...candidatePeak };
      (draft.data[index] as Datum1D).peaks.values.push(peak);
    }
  }
}

function addPeaks(draft: Draft<State>, action) {
  const state = original(draft) as State;

  if (draft.activeSpectrum) {
    const { index } = draft.activeSpectrum;
    const datumOriginal = state.data[index] as Datum1D;

    const { startX, endX } = action;
    const [from, to] = getRange(draft, { startX, endX });

    if (from !== to) {
      const peak = lookupPeak(datumOriginal.data, { from, to });
      if (
        peak &&
        !datumOriginal.peaks.values.some((p) => p.xIndex === peak.xIndex)
      ) {
        const newPeak = { id: generateID(), ...peak };
        (draft.data[index] as Datum1D).peaks.values.push(newPeak);
      }
    }
  }
}

function deletePeak(draft: Draft<State>, peakData) {
  const { index } = draft.activeSpectrum;
  const state = original(draft) as State;

  if (peakData == null) {
    (draft.data[index] as Datum1D).peaks.values = [];
  } else {
    const peakIndex = (state.data[index] as Datum1D).peaks.values.findIndex(
      (p) => p.id === peakData.id,
    );
    (draft.data[index] as Datum1D).peaks.values.splice(peakIndex, 1);
  }
}

function handleAutoPeakPicking(draft: Draft<State>, autOptions) {
  const state = original(draft);
  draft.selectedTool = options.zoom.id;
  draft.selectedOptionPanel = null;
  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const peaks = autoPeakPicking(state.data[index], autOptions);
    (draft.data[index] as Datum1D).peaks.values = peaks;
  }
}

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

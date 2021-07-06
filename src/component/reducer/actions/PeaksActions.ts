import { Draft, original } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';

import {
  lookupPeak,
  Datum1D,
  getShiftX,
} from '../../../data/data1d/Spectrum1D';
import autoPeakPicking from '../../../data/data1d/autoPeakPicking';
import generateID from '../../../data/utilities/generateID';
import { options } from '../../toolbar/ToolTypes';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

function addPeak(draft: Draft<State>, mouseCoordinates) {
  const state = original(draft) as State;
  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const xShift = 10;
    const startX = mouseCoordinates.x - xShift;
    const endX = mouseCoordinates.x + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = lookupPeak(state.data[index].data, { from, to });

    const shiftX = getShiftX(draft.data[index] as Datum1D);

    if (candidatePeak) {
      const peak = {
        id: generateID(),
        originDelta: candidatePeak.x - shiftX,
        delta: candidatePeak.x,
        intensity: candidatePeak.y,
      };
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

      const shiftX = getShiftX(draft.data[index] as Datum1D);

      if (peak && !datumOriginal.peaks.values.some((p) => p.delta === peak.x)) {
        const newPeak = {
          id: generateID(),
          originDelta: peak.x - shiftX,
          delta: peak.x,
          intensity: peak.y,
        };
        (draft.data[index] as Datum1D).peaks.values.push(newPeak);
      }
    }
  }
}

function deletePeak(draft: Draft<State>, peakData) {
  if (draft.activeSpectrum) {
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
}

function handleAutoPeakPicking(draft: Draft<State>, autOptions) {
  if (draft.activeSpectrum?.id) {
    draft.toolOptions.selectedTool = options.zoom.id;
    draft.toolOptions.selectedOptionPanel = null;
    const { index } = draft.activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const [from, to] = draft.xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    const peaks = autoPeakPicking(draft.data[index], {
      ...autOptions,
      windowFromIndex,
      windowToIndex,
    });

    datum.peaks.values = datum.peaks.values.concat(peaks);
  }
}

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

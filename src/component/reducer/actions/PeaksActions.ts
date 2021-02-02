import { original } from 'immer';

import { lookupPeak } from '../../../data/data1d/Datum1D';
import autoPeakPicking from '../../../data/data1d/autoPeakPicking';
import generateID from '../../../data/utilities/generateID';
import { options } from '../../toolbar/ToolTypes';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

// import { AnalysisObj } from '../core/Analysis';

function addPeak(draft: State, mouseCoordinates) {
  const state = original(draft);
  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const xShift = 10;
    const startX = mouseCoordinates.x - xShift;
    const endX = mouseCoordinates.x + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = lookupPeak(state.data[index].data, { from, to });
    if (candidatePeak) {
      const peak = { id: generateID(), ...candidatePeak };
      draft.data[index].peaks.values.push(peak);
    }
  }
}

function addPeaks(draft, action) {
  const state = original(draft);

  if (draft.activeSpectrum) {
    const { index } = draft.activeSpectrum;
    const { startX, endX } = action;
    const [from, to] = getRange(draft, { startX, endX });

    if (from !== to) {
      const peak = lookupPeak(state.data[index].data, { from, to });
      if (
        peak &&
        !state.data[index].peaks.values.some((p) => p.xIndex === peak.xIndex)
      ) {
        const newPeak = { id: generateID(), ...peak };
        draft.data[index].peaks.values.push(newPeak);
      }
    }
  }
}

function deletePeak(draft, peakData) {
  const { index } = draft.activeSpectrum;
  const state = original(draft);

  if (peakData == null) {
    draft.data[index].peaks.values = [];
  } else {
    const peakIndex = state.data[index].peaks.values.findIndex(
      (p) => p.id === peakData.id,
    );
    draft.data[index].peaks.values.splice(peakIndex, 1);
  }
}

function handleAutoPeakPicking(draft: State, autOptions) {
  const state = original(draft);
  draft.selectedTool = options.zoom.id;
  draft.selectedOptionPanel = null;
  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const peaks = autoPeakPicking(state.data[index], autOptions);
    draft.data[index].peaks.values = peaks;
  }
}

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

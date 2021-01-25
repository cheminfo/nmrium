import { original } from 'immer';

import { getXScale } from '../../1d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';

function getClosePeak(xShift, mouseCoordinates, state) {
  const scaleX = getXScale(state);
  const { activeSpectrum } = state;
  const start = scaleX.invert(mouseCoordinates.x - xShift);
  const end = scaleX.invert(mouseCoordinates.x + xShift);
  const range = [];
  if (start > end) {
    range[0] = end;
    range[1] = start;
  } else {
    range[0] = start;
    range[1] = end;
  }

  const closePeak = state.AnalysisObj.getDatum(activeSpectrum.id).lookupPeak(
    range[0],
    range[1],
  );
  return closePeak;
}

function addPeak(draft, mouseCoordinates) {
  const state = original(draft);
  if (draft.activeSpectrum) {
    const spectrumID = draft.activeSpectrum.id;

    const index = state.data.findIndex((d) => d.id === spectrumID);
    const candidatePeak = getClosePeak(10, mouseCoordinates, draft);

    if (index !== -1 && candidatePeak) {
      const peak = { xIndex: candidatePeak.xIndex };
      const newPeak = draft.AnalysisObj.getDatum(spectrumID).addPeak(peak);
      if (newPeak) draft.data[index].peaks.values.push(newPeak);
    }
  }
}

function addPeaks(draft, action) {
  const state = original(draft);

  if (draft.activeSpectrum) {
    const spectrumID = draft.activeSpectrum.id;
    const index = state.data.findIndex((d) => d.id === spectrumID);

    const scaleX = getXScale(draft);

    const start = scaleX.invert(action.startX);
    const end = scaleX.invert(action.endX);
    const range = [];
    if (start > end) {
      range[0] = end;
      range[1] = start;
    } else {
      range[0] = start;
      range[1] = end;
    }

    if (index !== -1) {
      const newPeak = draft.AnalysisObj.getDatum(spectrumID).addPeaks(
        range[0],
        range[1],
      );
      if (newPeak) draft.data[index].peaks.values.push(newPeak);
    }
  }
}

function deletePeak(draft, peakData) {
  const { id, index } = draft.activeSpectrum;
  const object = draft.AnalysisObj.getDatum(id);
  const peaks = object.deletePeak(peakData);

  draft.data[index].peaks.values = peaks;
}

function handleAutoPeakPicking(draft, autOptions) {
  const state = original(draft);
  draft.selectedTool = options.zoom.id;
  draft.selectedOptionPanel = null;
  const activeSpectrumId = draft.activeSpectrum.id;
  const ob = draft.AnalysisObj.getDatum(activeSpectrumId);
  const peaks = ob.applyAutoPeakPicking(autOptions);
  const index = state.data.findIndex((d) => d.id === activeSpectrumId);
  if (index !== -1) {
    draft.data[index].peaks = peaks;
  }
}

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

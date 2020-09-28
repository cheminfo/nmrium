import { produce } from 'immer';

import { getXScale } from '../../1d/utilities/scale';
import { options } from '../../toolbar/ToolTypes';
import { AnalysisObj } from '../core/Analysis';

function getClosePeak(xShift, mouseCoordinates, state) {
  const scaleX = getXScale(null, state);
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

  const closePeak = AnalysisObj.getDatum(activeSpectrum.id).lookupPeak(
    range[0],
    range[1],
  );
  return closePeak;
}

const addPeak = (state, mouseCoordinates) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;

      const index = state.data.findIndex((d) => d.id === spectrumID);
      const candidatePeak = getClosePeak(10, mouseCoordinates, state);

      if (index !== -1 && candidatePeak) {
        const peak = { xIndex: candidatePeak.xIndex };
        const newPeak = AnalysisObj.getDatum(spectrumID).addPeak(peak);
        if (newPeak) draft.data[index].peaks.values.push(newPeak);
      }
    }
  });
};

const addPeaks = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;
      const index = state.data.findIndex((d) => d.id === spectrumID);

      const scaleX = getXScale(null, state);

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
        const newPeak = AnalysisObj.getDatum(spectrumID).addPeaks(
          range[0],
          range[1],
        );
        if (newPeak) draft.data[index].peaks.values.push(newPeak);
      }
    }
  });
};

const deletePeak = (state, peakData) => {
  const { id, index } = state.activeSpectrum;
  const object = AnalysisObj.getDatum(id);
  const peaks = object.deletePeak(peakData);

  return produce(state, (draft) => {
    draft.data[index].peaks.values = peaks;
  });
};

const handleAutoPeakPicking = (state, autOptions) => {
  return produce(state, (draft) => {
    draft.selectedTool = options.zoom.id;
    draft.selectedOptionPanel = null;
    const activeSpectrumId = state.activeSpectrum.id;
    const ob = AnalysisObj.getDatum(activeSpectrumId);
    const peaks = ob.applyAutoPeakPicking(autOptions);
    const index = state.data.findIndex((d) => d.id === activeSpectrumId);
    if (index !== -1) {
      draft.data[index].peaks.values = peaks;
    }
  });
};

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

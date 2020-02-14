import { produce } from 'immer';

import { AnalysisObj } from '../core/initiate';
import { options } from '../../toolbar/ToolTypes';

import { getScale } from './ScaleActions';

function getClosePeak(xShift, mouseCoordinates, state) {
  const scale = getScale(state);
  const { activeSpectrum } = state;
  const start = scale.x.invert(mouseCoordinates.x - xShift);
  const end = scale.x.invert(mouseCoordinates.x + xShift);
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

      if (index !== -1) {
        const peak = { xIndex: candidatePeak.xIndex };
        AnalysisObj.getDatum(spectrumID).addPeak(peak);
        draft.data[index].peaks = AnalysisObj.getDatum(spectrumID).getPeaks();
      }
    }
  });
};

const addPeaks = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const spectrumID = state.activeSpectrum.id;
      const index = state.data.findIndex((d) => d.id === spectrumID);

      const scale = getScale(state);

      const start = scale.x.invert(action.startX);
      const end = scale.x.invert(action.endX);
      const range = [];
      if (start > end) {
        range[0] = end;
        range[1] = start;
      } else {
        range[0] = start;
        range[1] = end;
      }

      if (index !== -1) {
        const peaks = AnalysisObj.getDatum(spectrumID).addPeaks(
          range[0],
          range[1],
        );
        draft.data[index].peaks = peaks;
      }
    }
  });
};

const deletePeak = (state, peakData) => {
  return produce(state, (draft) => {
    const { id, index } = state.activeSpectrum;
    const object = AnalysisObj.getDatum(id);
    object.deletePeak(peakData);
    draft.data[index].peaks = object.getPeaks();
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
      draft.data[index].peaks = peaks;
    }
  });
};

export { addPeak, addPeaks, deletePeak, handleAutoPeakPicking };

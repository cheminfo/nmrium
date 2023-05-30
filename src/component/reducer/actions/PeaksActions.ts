import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Data1D, Peak1D, Spectrum1D } from 'nmr-load-save';

import {
  getShiftX,
  lookupPeak,
  autoPeakPicking,
  optimizePeaks,
} from '../../../data/data1d/Spectrum1D';
import { defaultPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';

function addPeak(draft: Draft<State>, action) {
  const { x: mouseXPosition } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  const state = original(draft) as State;

  if (activeSpectrum?.id && state) {
    const { index } = activeSpectrum;
    const xShift = 10;
    const startX = mouseXPosition - xShift;
    const endX = mouseXPosition + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = lookupPeak(state.data[index].data as Data1D, {
      from,
      to,
    });

    const shiftX = getShiftX(draft.data[index] as Spectrum1D);

    if (candidatePeak) {
      const peak: Peak1D = {
        id: v4(),
        originalX: candidatePeak.x - shiftX,
        x: candidatePeak.x,
        y: candidatePeak.y,
        width: 0,
      };
      (draft.data[index] as Spectrum1D).peaks.values.push(peak);
    }
  }
}

function addPeaks(draft: Draft<State>, action) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const datumOriginal = state.data[index] as Spectrum1D;

    const { startX, endX } = action.payload;
    const [from, to] = getRange(draft, { startX, endX });

    if (from !== to) {
      const peak = lookupPeak(datumOriginal.data, { from, to });

      const shiftX = getShiftX(draft.data[index] as Spectrum1D);

      if (peak && !datumOriginal.peaks.values.some((p) => p.x === peak.x)) {
        const newPeak: Peak1D = {
          id: v4(),
          originalX: peak.x - shiftX,
          x: peak.x,
          y: peak.y,
          width: 0,
        };
        (draft.data[index] as Spectrum1D).peaks.values.push(newPeak);
      }
    }
  }
}

function deletePeak(draft: Draft<State>, action) {
  const activeSpectrum = getActiveSpectrum(draft);
  const peakData = action.payload;

  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const state = original(draft) as State;

    if (peakData == null) {
      (draft.data[index] as Spectrum1D).peaks.values = [];
    } else {
      const peakIndex = (
        state.data[index] as Spectrum1D
      ).peaks.values.findIndex((p) => p.id === peakData.id);
      (draft.data[index] as Spectrum1D).peaks.values.splice(peakIndex, 1);
    }
  }
}

function handleOptimizePeaks(draft: Draft<State>, action) {
  const { peaks } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Spectrum1D;

    const [from, to] = draft.xDomain;

    const newPeaks = optimizePeaks(draft.data[index] as Spectrum1D, {
      from,
      to,
      peaks,
    });

    datum.peaks.values = newPeaks;
  }
}
function handleAutoPeakPicking(draft: Draft<State>, action) {
  const { maxNumberOfPeaks, minMaxRatio, noiseFactor, direction } =
    action.payload;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    draft.toolOptions.selectedTool = 'zoom';
    draft.toolOptions.selectedOptionPanel = null;
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Spectrum1D;

    const [from, to] = draft.xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    const peaks = autoPeakPicking(draft.data[index] as Spectrum1D, {
      maxNumberOfPeaks,
      minMaxRatio,
      noiseFactor,
      direction,
      windowFromIndex,
      windowToIndex,
    });

    datum.peaks.values = datum.peaks.values.concat(peaks);
  }
}

function changePeakShapeHandler(draft: Draft<State>, action) {
  const { shape, id } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Spectrum1D;
    const peakIndex = datum.peaks.values.findIndex((peak) => peak.id === id);

    if (peakIndex !== -1) {
      datum.peaks.values[peakIndex].shape = shape;
    }
  }
}

function handleTogglePeaksViewProperty(draft: Draft<State>, action) {
  const { key } = action.payload;
  togglePeaksViewProperty(draft, key);
}

function togglePeaksViewProperty(
  draft: Draft<State>,
  key: keyof typeof defaultPeaksViewState,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const peaksView = draft.view.peaks;
    if (peaksView[activeSpectrum.id]) {
      peaksView[activeSpectrum.id][key] = !peaksView[activeSpectrum.id][key];
    } else {
      const defaultPeaksView = { ...defaultPeaksViewState };
      defaultPeaksView[key] = !defaultPeaksView[key];
      peaksView[activeSpectrum.id] = defaultPeaksView;
    }
  }
}

export {
  addPeak,
  addPeaks,
  deletePeak,
  handleAutoPeakPicking,
  handleOptimizePeaks,
  changePeakShapeHandler,
  handleTogglePeaksViewProperty,
};

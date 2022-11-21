import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';

import {
  getShiftX,
  lookupPeak,
  autoPeakPicking,
  optimizePeaks,
} from '../../../data/data1d/Spectrum1D';
import { Datum1D } from '../../../data/types/data1d';
import { Data1D } from '../../../data/types/data1d/Data1D';
import { Peak } from '../../../data/types/data1d/Peak';
import { defaultPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import { options } from '../../toolbar/ToolTypes';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';

function addPeak(draft: Draft<State>, mouseCoordinates) {
  const activeSpectrum = getActiveSpectrum(draft);

  const state = original(draft) as State;

  if (activeSpectrum?.id && state) {
    const { index } = activeSpectrum;
    const xShift = 10;
    const startX = mouseCoordinates.x - xShift;
    const endX = mouseCoordinates.x + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = lookupPeak(state.data[index].data as Data1D, {
      from,
      to,
    });

    const shiftX = getShiftX(draft.data[index] as Datum1D);

    if (candidatePeak) {
      const peak: Peak = {
        id: v4(),
        originalX: candidatePeak.x - shiftX,
        x: candidatePeak.x,
        y: candidatePeak.y,
        width: 0,
      };
      (draft.data[index] as Datum1D).peaks.values.push(peak);
    }
  }
}

function addPeaks(draft: Draft<State>, action) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const datumOriginal = state.data[index] as Datum1D;

    const { startX, endX } = action;
    const [from, to] = getRange(draft, { startX, endX });

    if (from !== to) {
      const peak = lookupPeak(datumOriginal.data, { from, to });

      const shiftX = getShiftX(draft.data[index] as Datum1D);

      if (peak && !datumOriginal.peaks.values.some((p) => p.x === peak.x)) {
        const newPeak: Peak = {
          id: v4(),
          originalX: peak.x - shiftX,
          x: peak.x,
          y: peak.y,
          width: 0,
        };
        (draft.data[index] as Datum1D).peaks.values.push(newPeak);
      }
    }
  }
}

function deletePeak(draft: Draft<State>, peakData) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const { index } = activeSpectrum;
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

function handleOptimizePeaks(draft: Draft<State>, action) {
  const { peaks } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const [from, to] = draft.xDomain;

    const newPeaks = optimizePeaks(draft.data[index] as Datum1D, {
      from,
      to,
      peaks,
    });

    datum.peaks.values = newPeaks;
  }
}
function handleAutoPeakPicking(draft: Draft<State>, autOptions) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    draft.toolOptions.selectedTool = options.zoom.id;
    draft.toolOptions.selectedOptionPanel = null;
    const { index } = activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const [from, to] = draft.xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    const peaks = autoPeakPicking(draft.data[index] as Datum1D, {
      ...autOptions,
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
    const datum = draft.data[index] as Datum1D;
    const peakIndex = datum.peaks.values.findIndex((peak) => peak.id === id);

    if (peakIndex !== -1) {
      datum.peaks.values[peakIndex].shape = shape;
    }
  }
}

function handleShowPeaksShapes(draft: Draft<State>, action) {
  const { key } = action.payload;

  const peaksOptions = draft.toolOptions.data.peaksOptions;
  draft.toolOptions.data.peaksOptions = {
    ...peaksOptions,
    [key]: !peaksOptions[key],
  };
}

function handlePeaksVisibility(draft: Draft<State>) {
  togglePeaksViewProperty(draft, 'isPeaksVisible');
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
  handleShowPeaksShapes,
  handlePeaksVisibility,
};

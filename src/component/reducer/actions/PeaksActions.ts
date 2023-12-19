import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';
import {
  Spectrum1D,
  PeaksViewState,
  ViewState,
  RangesViewState,
} from 'nmr-load-save';
import { Peak1D, OptionsXYAutoPeaksPicking } from 'nmr-processing';

import {
  getShiftX,
  autoPeakPicking,
  optimizePeaks,
} from '../../../data/data1d/Spectrum1D';
import { defaultPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState';
import { defaultRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { FilterType } from '../../utility/filterType';
import { getClosePeak } from '../../utility/getClosePeak';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { ActionType } from '../types/ActionType';

type AddPeakAction = ActionType<'ADD_PEAK', { x: number }>;
type AddPeaksAction = ActionType<'ADD_PEAKS', { startX: number; endX: number }>;
type DeletePeakAction = ActionType<'DELETE_PEAK', { id?: string }>;
type OptimizePeaksAction = ActionType<'OPTIMIZE_PEAKS', { peaks: Peak1D[] }>;
type AutoPeaksPickingAction = ActionType<
  'AUTO_PEAK_PICKING',
  {
    maxNumberOfPeaks: number;
    minMaxRatio: number;
    noiseFactor: number;
    direction: OptionsXYAutoPeaksPicking['direction'];
  }
>;
type ChangePeaksShapeAction = ActionType<
  'CHANGE_PEAK_SHAPE',
  {
    id: string;
    shape: Peak1D['shape'];
  }
>;
type TogglePeaksViewAction = ActionType<
  'TOGGLE_PEAKS_VIEW_PROPERTY',
  {
    key: keyof FilterType<PeaksViewState, boolean>;
  }
>;

export type PeaksActions =
  | AddPeakAction
  | AddPeaksAction
  | DeletePeakAction
  | OptimizePeaksAction
  | AutoPeaksPickingAction
  | ChangePeaksShapeAction
  | TogglePeaksViewAction
  | ActionType<'TOGGLE_PEAKS_DISPLAYING_MODE'>;

//action
function handleAddPeak(draft: Draft<State>, action: AddPeakAction) {
  const { x: mouseXPosition } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  const state = original(draft) as State;

  if (activeSpectrum?.id && state) {
    const { index } = activeSpectrum;
    const xShift = 10;
    const startX = mouseXPosition - xShift;
    const endX = mouseXPosition + xShift;
    const [from, to] = getRange(draft, { startX, endX });
    const candidatePeak = getClosePeak(state.data[index] as Spectrum1D, {
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

//action
function handleAddPeaks(draft: Draft<State>, action: AddPeaksAction) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const datumOriginal = state.data[index] as Spectrum1D;

    const { startX, endX } = action.payload;
    const [from, to] = getRange(draft, { startX, endX });

    if (from !== to) {
      const peak = getClosePeak(datumOriginal, { from, to });

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

//action
function handleDeletePeak(draft: Draft<State>, action: DeletePeakAction) {
  const activeSpectrum = getActiveSpectrum(draft);
  const peakId = action?.payload?.id;

  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const state = original(draft) as State;

    if (!peakId) {
      (draft.data[index] as Spectrum1D).peaks.values = [];
    } else {
      const peakIndex = (
        state.data[index] as Spectrum1D
      ).peaks.values.findIndex((p) => p.id === peakId);
      (draft.data[index] as Spectrum1D).peaks.values.splice(peakIndex, 1);
    }
  }
}

//action
function handleOptimizePeaks(draft: Draft<State>, action: OptimizePeaksAction) {
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

//action
function handleAutoPeakPicking(
  draft: Draft<State>,
  action: AutoPeaksPickingAction,
) {
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

//action
function handleChangePeakShape(
  draft: Draft<State>,
  action: ChangePeaksShapeAction,
) {
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

//action
function handleTogglePeaksViewProperty(
  draft: Draft<State>,
  action: TogglePeaksViewAction,
) {
  const { key } = action.payload;
  togglePeaksViewProperty(draft, key);
}

function togglePeaksViewProperty(
  draft: Draft<State>,
  key: keyof FilterType<PeaksViewState, boolean>,
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

type TogglePeaksViewState = RangesViewState | PeaksViewState;
function toggleDisplayingPeaks(
  draft: Draft<State>,
  key: keyof Pick<ViewState, 'peaks' | 'ranges'>,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const viewOptions = draft.view[key];
    if (viewOptions[activeSpectrum.id]) {
      viewOptions[activeSpectrum.id].displayingMode =
        viewOptions[activeSpectrum.id].displayingMode === 'single'
          ? 'spread'
          : 'single';
    } else {
      let defaultsViewOptions = {} as TogglePeaksViewState;
      switch (key) {
        case 'peaks':
          defaultsViewOptions = { ...defaultPeaksViewState };

          break;
        case 'ranges':
          defaultsViewOptions = { ...defaultRangesViewState };
          break;
        default:
          break;
      }

      defaultsViewOptions.displayingMode =
        defaultsViewOptions.displayingMode === 'single' ? 'spread' : 'single';
      viewOptions[activeSpectrum.id] = defaultsViewOptions;
    }
  }
}

function handleChangePeaksDisplayingMode(draft: Draft<State>) {
  toggleDisplayingPeaks(draft, 'peaks');
}

export {
  handleAddPeak,
  handleAddPeaks,
  handleDeletePeak,
  handleAutoPeakPicking,
  handleOptimizePeaks,
  handleChangePeakShape,
  handleTogglePeaksViewProperty,
  handleChangePeaksDisplayingMode,
  toggleDisplayingPeaks,
};

import type { Peak1D } from '@zakodium/nmr-types';
import type {
  PeaksViewState,
  RangesViewState,
  Spectrum1D,
  ViewState,
} from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { original } from 'immer';
import { xFindClosestIndex } from 'ml-spectra-processing';
import type { OptionsXYAutoPeaksPicking } from 'nmr-processing';
import { mapPeaks } from 'nmr-processing';

import { DEFAULT_PEAK_SHAPE } from '../../../data/constants/defaultPeakShape.ts';
import {
  autoPeakPicking,
  getShiftX,
  isSpectrum1D,
  optimizePeaks,
} from '../../../data/data1d/Spectrum1D/index.js';
import { defaultPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import { getDefaultRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import type { FilterType } from '../../utility/filterType.js';
import { getClosePeak } from '../../utility/getClosePeak.js';
import type { State } from '../Reducer.js';
import { getActiveSpectra } from '../helper/getActiveSpectra.ts';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import getRange from '../helper/getRange.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import type { ActionType } from '../types/ActionType.js';

type AddPeakAction = ActionType<
  'ADD_PEAK',
  { x: number; defaultPeakShape?: Peak1D['shape'] }
>;
type AddPeaksAction = ActionType<
  'ADD_PEAKS',
  { startX: number; endX: number; defaultPeakShape?: Peak1D['shape'] }
>;
type DeletePeakAction = ActionType<
  'DELETE_PEAK',
  { id?: string; spectrumKey?: string }
>;
type OptimizePeaksAction = ActionType<'OPTIMIZE_PEAKS', { peaks: Peak1D[] }>;
type AutoPeaksPickingAction = ActionType<
  'AUTO_PEAK_PICKING',
  {
    options: {
      maxNumberOfPeaks: number;
      minMaxRatio: number;
      noiseFactor: number;
      direction: OptionsXYAutoPeaksPicking['direction'];
    };
    defaultPeakShape: Peak1D['shape'];
  }
>;
type ChangePeaksShapeAction = ActionType<
  'CHANGE_PEAK_SHAPE',
  {
    id?: string;
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
  const { x: mouseXPosition, defaultPeakShape = DEFAULT_PEAK_SHAPE } =
    action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const xShift = 10;
  const startX = mouseXPosition - xShift;
  const endX = mouseXPosition + xShift;
  const [from, to] = getRange(draft, { startX, endX });
  const candidatePeak = getClosePeak(original(spectrum), {
    from,
    to,
  });

  if (candidatePeak) {
    const shiftX = getShiftX(spectrum);
    const peak: Peak1D = {
      id: crypto.randomUUID(),
      originalX: candidatePeak.x - shiftX,
      x: candidatePeak.x,
      y: candidatePeak.y,
      width: 1,
      shape: defaultPeakShape,
    };
    spectrum.peaks.values.push(...mapPeaks([peak], spectrum));
  }
}

//action
function handleAddPeaks(draft: Draft<State>, action: AddPeaksAction) {
  const {
    startX,
    endX,
    defaultPeakShape = DEFAULT_PEAK_SHAPE,
  } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const [from, to] = getRange(draft, { startX, endX });

  if (from !== to) {
    const peak = getClosePeak(original(spectrum), { from, to });
    if (peak && !spectrum.peaks.values.some((p) => p.x === peak.x)) {
      const shiftX = getShiftX(spectrum);
      const newPeak: Peak1D = {
        id: crypto.randomUUID(),
        originalX: peak.x - shiftX,
        x: peak.x,
        y: peak.y,
        width: 1,
        shape: defaultPeakShape,
      };
      spectrum.peaks.values.push(newPeak);
    }
  }
}

//action
function handleDeletePeak(draft: Draft<State>, action: DeletePeakAction) {
  const { id: peakId, spectrumKey } = action.payload;

  const spectrum = getSpectrum(draft, spectrumKey);
  if (!isSpectrum1D(spectrum)) return;

  if (!peakId) {
    spectrum.peaks.values = [];
  } else {
    const peakIndex = spectrum.peaks.values.findIndex(
      (p: any) => p.id === peakId,
    );
    spectrum.peaks.values.splice(peakIndex, 1);
  }
}

//action
function handleOptimizePeaks(draft: Draft<State>, action: OptimizePeaksAction) {
  const { peaks } = action.payload;
  togglePeaksViewProperty(draft, 'showPeaksSum', true);

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const [from, to] = draft.xDomain;
  const newPeaks = optimizePeaks(spectrum, {
    from,
    to,
    peaks,
  });

  spectrum.peaks.values = newPeaks;
}

//action
function handleAutoPeakPicking(
  draft: Draft<State>,
  action: AutoPeaksPickingAction,
) {
  const { options, defaultPeakShape } = action.payload;

  const activeSpectra = getActiveSpectra(draft);

  if (!activeSpectra || activeSpectra?.length === 0) return;

  const spectra: Spectrum1D[] = [];

  for (const activeSpectrum of activeSpectra) {
    const spectrum = getSpectrum(draft, activeSpectrum.id);
    if (spectrum && isSpectrum1D(spectrum)) {
      spectra.push(spectrum);
    }
  }

  const [from, to] = draft.xDomain;

  for (const spectrum of spectra) {
    const windowFromIndex = xFindClosestIndex(spectrum.data.x, from);
    const windowToIndex = xFindClosestIndex(spectrum.data.x, to);

    const peaks = autoPeakPicking(spectrum, {
      ...options,
      windowFromIndex,
      windowToIndex,
      defaultPeakShape,
    });
    spectrum.peaks.values = spectrum.peaks.values.concat(peaks);
  }

  draft.toolOptions.selectedTool = 'zoom';
  draft.toolOptions.selectedOptionPanel = null;
}

//action
function handleChangePeakShape(
  draft: Draft<State>,
  action: ChangePeaksShapeAction,
) {
  const { shape, id } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  if (!id) {
    spectrum.peaks.values = spectrum.peaks.values.map((peak) => ({
      ...peak,
      shape,
    }));
    return;
  }

  const peakIndex = spectrum.peaks.values.findIndex((peak) => peak.id === id);
  if (peakIndex !== -1) {
    spectrum.peaks.values[peakIndex].shape = shape;
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
  value?: boolean,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (!activeSpectrum) return;

  const peaksView = draft.view.peaks;
  if (peaksView[activeSpectrum.id]) {
    peaksView[activeSpectrum.id][key] =
      value ?? !peaksView[activeSpectrum.id][key];
  } else {
    const defaultPeaksView = { ...defaultPeaksViewState };
    defaultPeaksView[key] = !defaultPeaksView[key];
    peaksView[activeSpectrum.id] = defaultPeaksView;
  }
}

type TogglePeaksViewState = RangesViewState | PeaksViewState;
function toggleDisplayingPeaks(
  draft: Draft<State>,
  key: keyof Pick<ViewState, 'peaks' | 'ranges'>,
) {
  const {
    view: {
      [key]: viewOptions,
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);
  if (!activeSpectrum) return;

  if (viewOptions[activeSpectrum.id]) {
    viewOptions[activeSpectrum.id].displayingMode =
      viewOptions[activeSpectrum.id].displayingMode === 'single'
        ? 'spread'
        : 'single';
  } else {
    let defaultsViewOptions: TogglePeaksViewState;
    switch (key) {
      case 'peaks':
        defaultsViewOptions = { ...defaultPeaksViewState };
        break;
      case 'ranges':
        defaultsViewOptions = getDefaultRangesViewState(nucleus);
        break;
      default:
        throw new Error(`Unknown view key: ${String(key)}`);
    }

    defaultsViewOptions.displayingMode =
      defaultsViewOptions.displayingMode === 'single' ? 'spread' : 'single';
    viewOptions[activeSpectrum.id] = defaultsViewOptions;
  }
}

function handleChangePeaksDisplayingMode(draft: Draft<State>) {
  toggleDisplayingPeaks(draft, 'peaks');
}

export {
  handleAddPeak,
  handleAddPeaks,
  handleAutoPeakPicking,
  handleChangePeakShape,
  handleChangePeaksDisplayingMode,
  handleDeletePeak,
  handleOptimizePeaks,
  handleTogglePeaksViewProperty,
  toggleDisplayingPeaks,
};

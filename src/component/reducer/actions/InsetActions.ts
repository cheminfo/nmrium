import { scaleLinear, zoomIdentity } from 'd3';
import type { Draft } from 'immer';
import type {
  IntegralsViewState,
  PeaksViewState,
  RangesViewState,
} from 'nmrium-core';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { insetMargin } from '../../1d/inset/InsetProvider.js';
import type {
  Inset,
  InsetBounding,
  InsetView,
} from '../../1d/inset/SpectraInsets.js';
import { getInsetXScale } from '../../1d/utilities/scale.js';
import type { ZoomOptions } from '../../EventsTrackers/BrushTracker.js';
import { defaultIntegralsViewState } from '../../hooks/useActiveSpectrumIntegralsViewState.js';
import { defaultPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import { defaultRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import {
  convertPercentToPixel,
  convertPixelToPercent,
} from '../../hooks/useSVGUnitConverter.js';
import type { FilterType } from '../../utility/filterType.js';
import type { SpectraDirection, State } from '../Reducer.js';
import {
  toScaleRatio,
  wheelZoom,
  ZOOM_TYPES,
} from '../helper/Zoom1DManager.js';
import type { ZoomType } from '../helper/Zoom1DManager.js';
import { preparePop } from '../helper/ZoomHistoryManager.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import getRange from '../helper/getRange.js';
import type { ActionType } from '../types/ActionType.js';

import { moveOverAxis } from './DomainActions.js';
import type { MoveOptions } from './DomainActions.js';

interface BrushInsetBoundary {
  startX: number;
  endX: number;
}

type AddInsetAction = ActionType<'ADD_INSET', { startX: number; endX: number }>;
type DeleteInsetAction = ActionType<'DELETE_INSET', { insetKey: string }>;
type ChangeInsetBoundingAction = ActionType<
  'CHANGE_INSET_BOUNDING',
  { insetKey: string; bounding: Partial<InsetBounding> }
>;
type MoveInsetAction = ActionType<
  'MOVE_INSET',
  MoveOptions & { insetKey: string }
>;
type BrushEndInsetAction = ActionType<
  'BRUSH_END_INSET',
  BrushInsetBoundary & { insetKey: string }
>;
type ZoomInsetAction = ActionType<
  'SET_INSET_ZOOM',
  { options: ZoomOptions; insetKey: string }
>;
type ZoomOutInsetAction = ActionType<
  'FULL_INSET_ZOOM_OUT',
  { zoomType?: ZoomType; insetKey: string }
>;

interface ToggleViewOptions<T> {
  insetKey: string;
  key: keyof FilterType<T, boolean>;
  value?: boolean;
}

type ToggleInsetRangesViewAction = ActionType<
  'TOGGLE_INSET_RANGES_VIEW_PROPERTY',
  ToggleViewOptions<RangesViewState>
>;

type ToggleInsetIntegralsViewAction = ActionType<
  'TOGGLE_INSET_INTEGRALS_VIEW_PROPERTY',
  ToggleViewOptions<IntegralsViewState>
>;
type ToggleInsetPeaksViewAction = ActionType<
  'TOGGLE_INSET_PEAKS_VIEW_PROPERTY',
  ToggleViewOptions<PeaksViewState>
>;
type ToggleInsetDisplayingPeaksModeAction = ActionType<
  'TOGGLE_INSET_PEAKS_DISPLAYING_MODE',
  {
    insetKey: string;
    target: 'peaks' | 'ranges';
  }
>;

export type InsetsActions =
  | AddInsetAction
  | DeleteInsetAction
  | ChangeInsetBoundingAction
  | MoveInsetAction
  | BrushEndInsetAction
  | ZoomInsetAction
  | ZoomOutInsetAction
  | ToggleInsetRangesViewAction
  | ToggleInsetIntegralsViewAction
  | ToggleInsetPeaksViewAction
  | ToggleInsetDisplayingPeaksModeAction;

function handleAddInset(draft: Draft<State>, action: AddInsetAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) return;

  const { index } = activeSpectrum;
  const datum = draft.data[index];

  if (!isSpectrum1D(datum)) return;

  const {
    yDomain,
    view: {
      spectra: { activeTab },
    },
    width: baseWidth,
    height: baseHeight,
  } = draft;
  const { id: spectrumKey } = datum;

  const { startX, endX } = action.payload;
  const xDomain = getRange(draft, { startX, endX });

  const width = Math.max(100, Math.abs(startX - endX));
  const x = Math.min(startX, endX);

  const inset: Inset = {
    id: crypto.randomUUID(),
    spectrumKey,
    bounding: {
      x: convertPixelToPercent(x, baseWidth),
      y: convertPixelToPercent(50, baseHeight),
      width: convertPixelToPercent(width, baseWidth),
      height: convertPixelToPercent(150, baseHeight),
    },
    xDomain,
    yDomain,
    zoomHistory: [{ xDomain, yDomain }],
    view: {
      ranges: { ...defaultRangesViewState },
      peaks: { ...defaultPeaksViewState },
      integrals: { ...defaultIntegralsViewState },
    },
  };

  if (draft.insets?.[activeTab]) {
    draft.insets[activeTab].push(inset);
  } else {
    draft.insets[activeTab] = [inset];
  }
}
function handleDeleteInset(draft: Draft<State>, action: DeleteInsetAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) return;

  const { index } = activeSpectrum;
  const datum = draft.data[index];

  if (!isSpectrum1D(datum)) return;
  const {
    view: {
      spectra: { activeTab },
    },
  } = draft;

  const { insetKey } = action.payload;

  draft.insets[activeTab] = draft.insets[activeTab].filter(
    (inset) => inset.id !== insetKey,
  );
}

function getInset(draft: Draft<State>, insetKey: string) {
  const {
    view: {
      spectra: { activeTab },
    },
  } = draft;

  const insets = draft.insets[activeTab];
  return insets.find((inset) => inset.id === insetKey);
}

function handleChangeInsetBounding(
  draft: Draft<State>,
  action: ChangeInsetBoundingAction,
) {
  const { insetKey, bounding } = action.payload;

  const inset = getInset(draft, insetKey);

  if (!inset) return;

  inset.bounding = { ...inset.bounding, ...bounding };
}

function handleMoveInset(draft: Draft<State>, action: MoveInsetAction) {
  const { insetKey, shiftX, shiftY } = action.payload;
  const inset = getInset(draft, insetKey);

  if (!inset) return;

  const originXDomain = draft.originDomain.xDomains[inset.spectrumKey];
  const originYDomain = draft.originDomain.yDomains[inset.spectrumKey];
  const { xDomain, yDomain } = moveOverAxis(
    { shiftX, shiftY },
    { xDomain: inset.xDomain, yDomain: inset.yDomain },
    { xDomain: originXDomain, yDomain: originYDomain },
  );
  inset.xDomain = xDomain;
  inset.yDomain = yDomain;
}

function getXScale(
  inset: Inset,
  options: { baseSize: number; mode: SpectraDirection },
) {
  const {
    xDomain: currentXDomain,
    bounding: { width },
  } = inset;
  const { mode, baseSize } = options;

  return getInsetXScale({
    width: convertPercentToPixel(width, baseSize),
    xDomain: currentXDomain,
    mode,
    margin: insetMargin,
  });
}

function handleInsetBrushEnd(draft: Draft<State>, action: BrushEndInsetAction) {
  const { insetKey, ...options } = action.payload;
  const inset = getInset(draft, insetKey);
  if (!inset) return;

  const startX = Math.min(options.startX, options.endX);
  const endX = Math.max(options.startX, options.endX);

  inset.xDomain = [startX, endX];
  inset.zoomHistory.push({ xDomain: [startX, endX], yDomain: inset.yDomain });
}

interface ZoomWithScroll1DOptions {
  zoomOptions: ZoomOptions;
  inset: Inset;
}

function zoomWithScroll(draft: Draft<State>, options: ZoomWithScroll1DOptions) {
  const { zoomOptions, inset } = options;
  const { width: baseSize } = draft;

  const { originDomain, mode } = draft;
  const scaleX = getXScale(inset, { baseSize, mode });
  const { invertScroll, deltaX, deltaY } = zoomOptions;

  const scaleRatio = toScaleRatio({ delta: deltaY || deltaX, invertScroll });

  const { x } = zoomOptions;
  const domain = zoomIdentity
    .translate(x, 0)
    .scale(scaleRatio)
    .translate(-x, 0)
    .rescaleX(scaleX)
    .domain();
  const [x1, x2] = originDomain.xDomains[inset.spectrumKey];
  inset.xDomain = [Math.max(domain[0], x1), Math.min(domain[1], x2)];
}

function handleInsetZoom(draft: Draft<State>, action: ZoomInsetAction) {
  const { options, insetKey } = action.payload;
  const {
    toolOptions: { selectedTool },
  } = draft;
  const { altKey, shiftKey, deltaX, deltaY, invertScroll } = options;
  const inset = getInset(draft, insetKey);

  if (!inset) return;

  // Horizontal zoom in/out 1d spectra by mouse wheel
  if (shiftKey) {
    zoomWithScroll(draft, { zoomOptions: options, inset });
    return;
  }

  if (altKey) {
    // rescale the integral in ranges and integrals
    const { view } = inset;
    const scaleRatio = toScaleRatio({ delta: deltaY | deltaX, invertScroll });

    if (selectedTool === 'rangePicking') {
      view.ranges.integralsScaleRatio *= scaleRatio;
      return;
    }
    if (selectedTool === 'integral') {
      view.integrals.scaleRatio *= scaleRatio;
      return;
    }
    return;
  }

  inset.yDomain = wheelZoom(options, inset.yDomain);
}

function setZoom(
  draft: Draft<State>,
  options: {
    scale?: number;
    inset: Inset;
  },
) {
  const { scale = 1, inset } = options;
  const {
    bounding: { height },
  } = inset;
  const { originDomain } = draft;

  const originalYDomain = originDomain.yDomains[inset.spectrumKey];

  const scaleValue = scaleLinear(originalYDomain, [
    height - insetMargin.bottom,
    insetMargin.top,
  ]);
  const t = zoomIdentity
    .translate(0, scaleValue(0))
    .scale(scale)
    .translate(0, -scaleValue(0));
  inset.yDomain = t.rescaleY(scaleValue).domain();
}

function handleInsetZoomOut(draft: Draft<State>, action: ZoomOutInsetAction) {
  const { zoomType, insetKey } = action?.payload || {};

  const inset = getInset(draft, insetKey);

  if (!inset) return;
  const originXDomain = draft.originDomain.xDomains[inset.spectrumKey];
  const originYDomain = draft.originDomain.yDomains[inset.spectrumKey];

  const pop = preparePop(inset.zoomHistory, {
    xDomain: originXDomain,
    yDomain: originYDomain,
  });

  switch (zoomType) {
    case ZOOM_TYPES.HORIZONTAL: {
      inset.xDomain = originXDomain;
      inset.zoomHistory = [];
      break;
    }
    case ZOOM_TYPES.VERTICAL:
      setZoom(draft, { scale: 0.8, inset });
      break;
    case ZOOM_TYPES.BIDIRECTIONAL: {
      const zoomValue = pop();
      if (zoomValue) {
        inset.xDomain = zoomValue.xDomain;
        draft.yDomain = zoomValue.yDomain;
        const ids = Object.keys(draft.yDomains);
        for (const id of ids) {
          draft.yDomains[id] = zoomValue.yDomain;
        }
      } else {
        inset.xDomain = originXDomain;
        setZoom(draft, { scale: 0.8, inset });
      }
      break;
    }
    default: {
      inset.xDomain = originXDomain;
      setZoom(draft, { scale: 0.8, inset });
      inset.zoomHistory = [];
      break;
    }
  }
}

function toggleViewProperty<T extends keyof InsetView>(
  draft: Draft<State>,
  insetKey: string,
  key: `${T}.${Extract<keyof FilterType<InsetView[T], boolean>, string>}`,
  value?: boolean,
) {
  const inset = getInset(draft, insetKey);

  if (!inset) return;

  const [baseKey, toggleProperty] = key.split('.');
  const target = inset.view[baseKey];
  if (typeof value === 'boolean') {
    target[toggleProperty] = value;
  } else {
    target[toggleProperty] = !target[toggleProperty];
  }
}

function handleToggleInsetRangesViewProperty(
  draft: Draft<State>,
  action: ToggleInsetRangesViewAction,
) {
  const { insetKey, key, value } = action.payload;
  toggleViewProperty(draft, insetKey, `ranges.${key}`, value);
}
function handleToggleInsetIntegralsViewProperty(
  draft: Draft<State>,
  action: ToggleInsetIntegralsViewAction,
) {
  const { insetKey, key, value } = action.payload;
  toggleViewProperty(draft, insetKey, `integrals.${key}`, value);
}
function handleToggleInsetPeaksViewProperty(
  draft: Draft<State>,
  action: ToggleInsetPeaksViewAction,
) {
  const { insetKey, key, value } = action.payload;
  toggleViewProperty(draft, insetKey, `peaks.${key}`, value);
}

function handleToggleInsetDisplayingPeaksMode(
  draft: Draft<State>,
  action: ToggleInsetDisplayingPeaksModeAction,
) {
  const { insetKey, target } = action.payload;

  const inset = getInset(draft, insetKey);

  if (!inset) return;

  const targetView = inset.view[target];
  targetView.displayingMode =
    targetView.displayingMode === 'single' ? 'spread' : 'single';
}

export {
  handleAddInset,
  handleDeleteInset,
  handleChangeInsetBounding,
  handleMoveInset,
  handleInsetBrushEnd,
  handleInsetZoom,
  handleInsetZoomOut,
  handleToggleInsetRangesViewProperty,
  handleToggleInsetIntegralsViewProperty,
  handleToggleInsetPeaksViewProperty,
  handleToggleInsetDisplayingPeaksMode,
};

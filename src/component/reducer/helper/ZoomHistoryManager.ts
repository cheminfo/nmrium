import type { Draft } from 'immer';

import type { BrushAxis } from '../../EventsTrackers/brush_tracker.types.ts';
import type { State } from '../Reducer.js';

import { getSpectrum } from './getSpectrum.js';

interface HistoryItem {
  xDomain: number[];
  yDomain: number[];
}

export type ZoomHistory = Record<string, HistoryItem[]>;
interface BaseZoomHistoryManager {
  historyStack: HistoryItem[];
  push: (value: HistoryItem) => void;
  setBase: (value: HistoryItem) => void;
  pop: () => HistoryItem;
  getLast: () => HistoryItem;
}
interface ZoomHistoryManager extends BaseZoomHistoryManager {
  clear: () => void;
}

export default function zoomHistoryManager(
  zoomHistory: ZoomHistory,
  nucleus: string,
): ZoomHistoryManager {
  if (!zoomHistory[nucleus] && !Array.isArray(zoomHistory[nucleus])) {
    zoomHistory[nucleus] = [];
  }
  const history = zoomHistory[nucleus];

  const setBase = prepareSetBase(history);
  const push = preparePush(history);
  const pop = preparePop(history);
  const getLast = prepareGetLast(history);
  const clear = () => (zoomHistory[nucleus] = []);

  return { historyStack: history, push, pop, getLast, clear, setBase };
}

function preparePush(historyStack: any) {
  return (val: HistoryItem) => {
    historyStack.push(val);
  };
}

function prepareSetBase(historyStack: any) {
  return (val: HistoryItem) => {
    if (historyStack.length === 0) {
      historyStack[0] = val;
    }
  };
}

function popZoomHistory(historyStack: any) {
  const val = historyStack.pop();

  if (historyStack.length === 0) {
    return null;
  }

  return val ? historyStack.at(-1) : null;
}

export function preparePop(historyStack: any) {
  return () => popZoomHistory(historyStack);
}

function prepareGetLast(historyStack: any) {
  return () => {
    if (historyStack.length === 0) return null;
    return historyStack.at(-1);
  };
}

export function addToBrushHistory(
  draft: Draft<State>,
  options: { axis?: BrushAxis | null; xDomain: number[]; yDomain: number[] },
) {
  const { axis } = options;
  let { xDomain, yDomain } = options;

  const brushHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );

  brushHistory.setBase({ xDomain: draft.xDomain, yDomain: draft.yDomain });

  switch (axis) {
    case 'XY':
      draft.xDomain = xDomain;
      draft.yDomain = yDomain;
      break;
    case 'X':
      draft.xDomain = xDomain;
      yDomain = draft.yDomain;
      break;
    case 'Y':
      draft.yDomain = yDomain;
      xDomain = draft.xDomain;

      break;
    default:
      break;
  }

  if (draft.displayerMode === '1D' && axis && ['XY', 'Y'].includes(axis)) {
    const ids = Object.keys(draft.yDomains);
    for (const id of ids) {
      draft.yDomains[id] = yDomain;
    }
  }

  if (brushHistory) {
    brushHistory.push({ xDomain, yDomain });
  }
}

interface RestoreLastZoomDomainOptions {
  /**
   * Set to true when the displayed spectrum switched between FID and FT.
   * A FID <-> FT transition regenerates the x axis, so any zoom domain stored
   * for the previous state is expressed in a different scale and must be
   * discarded instead of restored (otherwise the previous zoom is applied to
   * the new axis, e.g. FFT keeps the FID zoom range and only flips the scale).
   */
  isFtStateChanged?: boolean;
}

export function restoreLastZoomDomain(
  draft: Draft<State>,
  options: RestoreLastZoomDomainOptions = {},
) {
  const zoomHistory = zoomHistoryManager(
    draft.zoom.history,
    draft.view.spectra.activeTab,
  );

  if (options.isFtStateChanged) {
    zoomHistory.clear();
    return false;
  }

  const zoomValue = zoomHistory.getLast();

  if (!zoomValue) {
    return false;
  }

  draft.xDomain = zoomValue.xDomain;
  draft.yDomain = zoomValue.yDomain;

  return true;
}

/**
 * Restore the last zoom domain, unless the active spectrum switched between FID
 * and FT since `previousIsFt` was captured. This is the shared criterion for
 * every action that re-processes a spectrum (processings panel, legacy filter
 * panel, FFT): a FID <-> FT transition regenerates the x axis, so the stored
 * zoom is stale and the freshly computed full domain must be kept instead.
 */
export function restoreLastZoomUnlessDomainChanged(
  draft: Draft<State>,
  previousIsFt: boolean,
) {
  const currentIsFt = getSpectrum(draft)?.info.isFt ?? previousIsFt;

  return restoreLastZoomDomain(draft, {
    isFtStateChanged: previousIsFt !== currentIsFt,
  });
}

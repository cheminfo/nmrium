import type { Draft } from 'immer';

import type { Layout } from '../../2d/utilities/DimensionLayout.js';
import type { State } from '../Reducer.js';

export interface HistoryItem {
  xDomain: number[];
  yDomain: number[];
}

export type ZoomHistory = Record<string, HistoryItem[]>;
interface BaseZoomHistoryManager {
  historyStack: HistoryItem[];
  push: (value: HistoryItem) => void;
  pop: () => HistoryItem;
  getLast: () => HistoryItem;
}
interface ZoomHistoryManager extends BaseZoomHistoryManager {
  clear: () => void;
}

export default function zoomHistoryManager(
  zoomHistory: ZoomHistory,
  nucleus: string,
  baseZoom?: HistoryItem,
): ZoomHistoryManager {
  if (!zoomHistory[nucleus] && !Array.isArray(zoomHistory[nucleus])) {
    zoomHistory[nucleus] = [];
  }
  const history = zoomHistory[nucleus];

  const push = preparePush(history);
  const pop = preparePop(history, baseZoom);
  const getLast = prepareGetLast(history);
  const clear = () => (zoomHistory[nucleus] = []);

  return { historyStack: history, push, pop, getLast, clear };
}

function preparePush(historyStack) {
  return (val: HistoryItem) => {
    historyStack.push(val);
  };
}

export function popZoomHistory(historyStack, baseZoom?: HistoryItem) {
  const val = historyStack.pop();

  if (val && historyStack.length === 0) {
    return baseZoom || null;
  }

  return val ? historyStack.at(-1) : null;
}

export function preparePop(historyStack, baseZoom?: HistoryItem) {
  return () => popZoomHistory(historyStack, baseZoom);
}

function prepareGetLast(historyStack) {
  return () => {
    if (historyStack.length === 0) return null;
    return historyStack.at(-1);
  };
}

export function addToBrushHistory(
  draft: Draft<State>,
  options: { trackID?: Layout | null; xDomain: number[]; yDomain: number[] },
) {
  const { displayerMode } = draft;
  const { trackID, xDomain, yDomain } = options;
  const brushHistory = zoomHistoryManager(
    draft.zoom.history,

    draft.view.spectra.activeTab,
  );
  if (displayerMode === '2D') {
    switch (trackID) {
      case 'CENTER_2D':
        draft.xDomain = xDomain;
        draft.yDomain = yDomain;
        break;
      case 'TOP_1D':
        draft.xDomain = xDomain;
        break;
      case 'LEFT_1D':
        draft.yDomain = yDomain;
        break;
      default:
        break;
    }
    if (brushHistory) {
      brushHistory.push({ xDomain, yDomain });
    }
  } else {
    draft.xDomain = xDomain;
    if (brushHistory) {
      brushHistory.push({ xDomain, yDomain });
    }
  }
}

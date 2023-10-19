import { Draft } from 'immer';

import { Layout } from '../../2d/utilities/DimensionLayout';
import { State } from '../Reducer';

interface HistoryItem {
  xDomain: number[];
  yDomain: number[];
}

export type ZoomHistory = Record<string, HistoryItem[]>;
interface ZoomHistoryManager {
  historyStack: HistoryItem[];
  push: (value: HistoryItem) => void;
  pop: () => HistoryItem;
  getLast: () => HistoryItem;
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

  const push = preparePush(zoomHistory[nucleus]);
  const pop = preparePop(zoomHistory[nucleus], baseZoom);
  const getLast = prepareGetLast(zoomHistory[nucleus]);
  const clear = () => (zoomHistory[nucleus] = []);
  return { historyStack: zoomHistory[nucleus], push, pop, getLast, clear };
}

function preparePush(historyStack) {
  return (val: HistoryItem) => {
    historyStack.push(val);
  };
}

function preparePop(historyStack, baseZoom?: HistoryItem) {
  return () => {
    const val = historyStack.pop();

    if (val && historyStack.length === 0) {
      return baseZoom || null;
    }

    return val ? historyStack.at(-1) : null;
  };
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
    // eslint-disable-next-line unicorn/consistent-destructuring
    draft.zoom.history,
    // eslint-disable-next-line unicorn/consistent-destructuring
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

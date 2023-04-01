interface HistoryItem {
  xDomain: Array<number>;
  yDomain: Array<number>;
}

export interface ZoomHistory {
  [key: string]: Array<HistoryItem>;
}
interface ZoomHistoryManager {
  historyStack: Array<HistoryItem>;
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

    return val ? historyStack[historyStack.length - 1] : null;
  };
}

function prepareGetLast(historyStack) {
  return () => {
    if (historyStack.length === 0) return null;
    return historyStack[historyStack.length - 1];
  };
}

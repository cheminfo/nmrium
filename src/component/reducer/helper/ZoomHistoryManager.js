export default function zoomHistoryManager(ZoomHistoryObject, nucleus) {
  if (
    !ZoomHistoryObject[nucleus] &&
    !Array.isArray(ZoomHistoryObject[nucleus])
  ) {
    ZoomHistoryObject[nucleus] = [];
  }

  const push = preparePush(ZoomHistoryObject[nucleus]);
  const pop = preparePop(ZoomHistoryObject[nucleus]);
  const getLast = prepareGetLast(ZoomHistoryObject[nucleus]);
  return { historyStack: ZoomHistoryObject[nucleus], push, pop, getLast };
}

function preparePush(historyStack) {
  return (val) => {
    historyStack.push(val);
  };
}

function preparePop(historyStack) {
  return () => {
    const val = historyStack.pop();
    return val ? historyStack[historyStack.length - 1] : null;
  };
}

function prepareGetLast(historyStack) {
  return () => {
    if (historyStack.length === 0) return null;
    return historyStack[historyStack.length - 1];
  };
}

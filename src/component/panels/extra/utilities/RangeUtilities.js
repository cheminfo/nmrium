import loadsh from 'lodash';

import { HighlightSignalConcatenation } from '../constants/ConcatenationStrings';

const getDiaIDs = (range) => {
  return [].concat(
    range.diaID || [],
    range.signal
      ? range.signal.map((_signal) => _signal.diaID || []).flat()
      : [],
  );
};

const getPubIntegral = (range) => {
  return getDiaIDs(range).length;
};

const setPubIntegral = (range) => {
  range.pubIntegral = getPubIntegral(range);
  if (range.pubIntegral === 0) {
    delete range.pubIntegral;
  }
};

const resetDiaIDs = (range) => {
  delete range.diaID;
  range.signal.forEach((_signal) => {
    delete _signal.diaID;
  });
  delete range.pubIntegral;
};

const unlink = (range, isOnRangeLevel, signalIndex) => {
  const rangeObject = loadsh.cloneDeep(range);

  if (isOnRangeLevel !== undefined) {
    if (isOnRangeLevel === true) {
      delete rangeObject.diaID;
    } else if (signalIndex !== undefined) {
      delete rangeObject.signal[signalIndex].diaID;
    }
  } else {
    resetDiaIDs(rangeObject);
  }
  setPubIntegral(rangeObject);
  return rangeObject;
};

const addDefaultSignal = (range) => {
  range.signal.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
};

const checkSignalKinds = (range, kinds) => {
  return !range.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
};

const unlinkInAssignmentData = (
  assignmentData,
  range,
  isOnRangeLevel,
  signalIndex,
) => {
  if (isOnRangeLevel !== undefined) {
    if (isOnRangeLevel === true) {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: { id: range.id, axis: 'x' },
      });
    } else if (signalIndex !== undefined) {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${range.id}${HighlightSignalConcatenation}${signalIndex}`,
          axis: 'x',
        },
      });
    }
  } else {
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: { id: range.id, axis: 'x' },
    });
    range.signal.forEach((_signal, i) =>
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${range.id}${HighlightSignalConcatenation}${i}`,
          axis: 'x',
        },
      }),
    );
  }
};

export {
  addDefaultSignal,
  checkSignalKinds,
  getDiaIDs,
  getPubIntegral,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};

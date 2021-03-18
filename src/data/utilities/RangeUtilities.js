import { DatumKind } from '../constants/SignalsKinds';

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
  if (isOnRangeLevel !== undefined) {
    if (isOnRangeLevel === true) {
      delete range.diaID;
    } else if (signalIndex !== undefined) {
      delete range.signal[signalIndex].diaID;
    }
  } else {
    resetDiaIDs(range);
  }
  setPubIntegral(range);

  return range;
};

const addDefaultSignal = (range) => {
  range.signal.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
};

const checkRangeKind = (range) => {
  return range.kind === DatumKind.signal;
};

const checkSignalKinds = (range, kinds) => {
  return !range.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
};

const unlinkInAssignmentData = (assignmentData, ranges) => {
  const ids = ranges.reduce((acc, range) => {
    acc.push(range.id);
    if (range.signal) {
      acc.concat(range.signal.map((signal) => signal.id, []));
    }
    return acc;
  }, []);

  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id: ids, axis: 'x' },
  });
};

export {
  addDefaultSignal,
  checkRangeKind,
  checkSignalKinds,
  getDiaIDs,
  getPubIntegral,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};

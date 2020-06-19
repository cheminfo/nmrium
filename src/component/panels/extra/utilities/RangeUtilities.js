import { isOnRangeLevel } from './MultiplicityUtilities';

const getPubIntegral = (range) => {
  return []
    .concat(
      range.diaID || [],
      range.signal
        ? range.signal.map((_signal) => _signal.diaID || []).flat()
        : [],
    )
    .filter((_diaID, i, _diaIDs) => _diaIDs.indexOf(_diaID) === i).length;
};

const getDiaIDsWithLevels = (range) => {
  return range.signal
    ? range.signal
        .map((_signal, i) => {
          return range.diaID &&
            range.diaID.length > 0 &&
            isOnRangeLevel(_signal.multiplicity)
            ? [{ level: 'range', diaID: range.diaID, signalIndex: i }]
            : _signal.diaID && _signal.diaID.length > 0
            ? [{ level: 'signal', diaID: _signal.diaID, signalIndex: i }]
            : [];
        })
        .flat()
    : [];
};

const resetDiaIDs = (range) => {
  delete range.diaID;
  range.signal.forEach((_signal) => {
    delete _signal.diaID;
  });
  delete range.pubIntegral;
};

const unlink = (range, signalIndex) => {
  if (signalIndex !== undefined) {
    if (isOnRangeLevel(range.signal[signalIndex].multiplicity)) {
      delete range.diaID;
    } else {
      delete range.signal[signalIndex].diaID;
    }
    range.pubIntegral = getPubIntegral(range);
    if (range.pubIntegral === 0) {
      delete range.pubIntegral;
    }
  } else {
    resetDiaIDs(range);
  }
};

const addDefaultSignal = (range) => {
  range.signal.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
};

export {
  addDefaultSignal,
  getDiaIDsWithLevels,
  getPubIntegral,
  resetDiaIDs,
  unlink,
};

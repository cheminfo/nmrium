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

const checkSignalKinds = (range, kinds) => {
  return !range.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
};

export {
  addDefaultSignal,
  checkSignalKinds,
  getPubIntegral,
  resetDiaIDs,
  unlink,
};

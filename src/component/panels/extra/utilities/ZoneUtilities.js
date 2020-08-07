const getDiaIDs = (zone, axis) => {
  return [].concat(
    zone[axis].diaID || [],
    zone.signal
      ? zone.signal.map((_signal) => _signal[axis].diaID || []).flat()
      : [],
  );
};

const getPubIntegral = (zone, axis) => {
  return getDiaIDs(zone, axis).length;
};

const setPubIntegral = (zone, axis) => {
  zone[axis].pubIntegral = getPubIntegral(zone, axis);
  if (zone[axis].pubIntegral === 0) {
    delete zone[axis].pubIntegral;
  }
};

const resetDiaIDs = (zone, axis) => {
  delete zone[axis].diaID;
  zone.signal.forEach((_signal) => {
    delete _signal[axis].diaID;
  });
  delete zone.pubIntegral;
};

const unlink = (zone, isOnZoneLevel, signalIndex, axis) => {
  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel === true) {
      delete zone[axis].diaID;
    } else if (signalIndex !== undefined) {
      delete zone.signal[signalIndex][axis].diaID;
    }
    setPubIntegral(zone, axis);
  } else if (axis !== undefined) {
    resetDiaIDs(zone, axis);
    setPubIntegral(zone, axis);
  } else {
    resetDiaIDs(zone, 'x');
    setPubIntegral(zone, 'x');
    resetDiaIDs(zone, 'y');
    setPubIntegral(zone, 'y');
  }
};

export { getDiaIDs, getPubIntegral, resetDiaIDs, unlink };

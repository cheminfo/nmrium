import lodash from 'lodash';

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
  delete zone.pubIntegral;
  zone.signal.forEach((_signal) => {
    delete _signal[axis].diaID;
  });
  return zone;
};

const unlink = (zone, isOnZoneLevel, signalIndex, axis) => {
  const zoneObject = lodash.cloneDeep(zone);

  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel === true) {
      delete zoneObject[axis].diaID;
    } else if (signalIndex !== undefined) {
      delete zoneObject.signal[signalIndex][axis].diaID;
    }
    setPubIntegral(zoneObject, axis);
  } else if (axis !== undefined) {
    resetDiaIDs(zoneObject, axis);
    setPubIntegral(zoneObject, axis);
  } else {
    ['x', 'y'].forEach((key) => {
      resetDiaIDs(zoneObject, key);
      setPubIntegral(zoneObject, key);
    });
  }
  return zoneObject;
};

export { getDiaIDs, getPubIntegral, resetDiaIDs, unlink };

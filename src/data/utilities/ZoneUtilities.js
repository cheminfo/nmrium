import { DatumKind } from '../constants/SignalsKinds';

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

const checkZoneKind = (zone) => {
  return zone.kind === DatumKind.signal;
};

const checkSignalKinds = (zone, kinds) => {
  return !zone.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
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
    ['x', 'y'].forEach((key) => {
      resetDiaIDs(zone, key);
      setPubIntegral(zone, key);
    });
  }
  return zone;
};

const unlinkInAssignmentData = (assignmentData, zones, axis) => {
  const ids = zones.reduce((acc, zone) => {
    acc.push(zone.id);
    if (zone.signal) {
      acc.concat(zone.signal.map((signal) => signal.id, []));
    }
    return acc;
  }, []);

  if (axis) {
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: { id: ids, axis },
    });
  } else {
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: { id: ids, axis: 'x' },
    });
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: { id: ids, axis: 'y' },
    });
  }
};

export {
  checkSignalKinds,
  checkZoneKind,
  getDiaIDs,
  getPubIntegral,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};

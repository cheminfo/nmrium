import { DatumKind } from '../constants/SignalsKinds';

export function getDiaIDs(zone, axis) {
  return [].concat(
    zone[axis].diaID || [],
    zone.signal
      ? zone.signal.map((_signal) => _signal[axis].diaID || []).flat()
      : [],
  );
}

export function getPubIntegral(zone, axis) {
  return getDiaIDs(zone, axis).length;
}

export function setPubIntegral(zone, axis) {
  zone[axis].pubIntegral = getPubIntegral(zone, axis);
  if (zone[axis].pubIntegral === 0) {
    delete zone[axis].pubIntegral;
  }
}

export function resetDiaIDs(zone, axis) {
  delete zone[axis].diaID;
  delete zone.pubIntegral;
  zone.signal.forEach((_signal) => {
    delete _signal[axis].diaID;
  });
  return zone;
}

export function checkZoneKind(zone) {
  return zone.kind === DatumKind.signal;
}

export function checkSignalKinds(zone, kinds) {
  return !zone.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlink(zone, isOnZoneLevel, signalIndex, axis) {
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
}

export function unlinkInAssignmentData(assignmentData, zones, axis) {
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
}

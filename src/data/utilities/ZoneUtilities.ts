import { DatumKind } from '../constants/SignalsKinds';

export function getDiaIDs(zone, axis) {
  return [].concat(
    zone[axis].diaIDs || [],
    zone.signals
      ? zone.signals.map((signal) => signal[axis].diaIDs || []).flat()
      : [],
  );
}

export function getPubIntegral(zone, axis) {
  return (
    zone.nbAtoms ||
    (zone.signals
      ? zone.signals.reduce(
          (sum, signal) =>
            signal[axis].nbAtoms ? sum + signal[axis].nbAtoms : sum,
          0,
        )
      : 0)
  );
}

export function setPubIntegral(zone, axis) {
  zone[axis].pubIntegral = getPubIntegral(zone, axis);
  if (zone[axis].pubIntegral === 0) {
    delete zone[axis].pubIntegral;
  }
}

export function resetDiaIDs(zone, axis) {
  delete zone[axis].diaIDs;
  delete zone[axis].nbAtoms;
  delete zone.pubIntegral;
  zone.signals.forEach((signal) => {
    delete signal[axis].diaIDs;
    delete signal[axis].nbAtoms;
  });
  return zone;
}

export function checkZoneKind(zone) {
  return zone.kind === DatumKind.signal;
}

export function checkSignalKinds(zone, kinds) {
  return !zone.signals.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlink(
  zone,
  isOnZoneLevel?: any,
  signalIndex?: any,
  axis?: any,
) {
  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel === true) {
      delete zone[axis].diaIDs;
      delete zone[axis].nbAtoms;
    } else if (
      typeof signalIndex === 'number' &&
      signalIndex !== -1 &&
      zone.signals[signalIndex]
    ) {
      delete zone.signals[signalIndex][axis].diaIDs;
      delete zone.signals[signalIndex][axis].nbAtoms;
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

export function unlinkInAssignmentData(assignmentData, zones, axis?: any) {
  const ids = zones.reduce((acc, zone) => {
    acc.push(zone.id);
    if (zone.signals) {
      acc.concat(zone.signals.map((signal) => signal.id, []));
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

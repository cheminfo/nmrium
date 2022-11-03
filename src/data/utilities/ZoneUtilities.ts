import { DatumKind } from '../constants/SignalsKinds';
import { Zone } from '../types/data2d';

export function getDiaIDs(zone: Zone, axis: string): string[] {
  return ([] as string[]).concat(
    zone[axis].diaIDs || [],
    zone.signals
      ? zone.signals.flatMap((signal) => signal[axis].diaIDs || [])
      : [],
  );
}

export function getNbAtoms(zone: Zone, axis: string) {
  let sum = 0;
  if (zone.signals) {
    for (const signal of zone.signals) {
      sum += signal[axis].nbAtoms || 0;
    }
  }
  return sum;
}

export function setNbAtoms(zone: Zone, axis: string): void {
  zone[axis].nbAtoms = getNbAtoms(zone, axis);
  if (zone[axis].nbAtoms === 0) {
    delete zone[axis].nbAtoms;
  }
}

export function resetDiaIDs(zone: Zone, axis: string) {
  delete zone[axis].diaIDs;
  delete zone[axis].nbAtoms;
  for (const signal of zone.signals) {
    delete signal[axis].diaIDs;
    delete signal[axis].nbAtoms;
  }
  return zone;
}

export function checkZoneKind(zone: Zone): boolean {
  return zone.kind === DatumKind.signal;
}

export function checkSignalKinds(zone: Zone, kinds: string[]): boolean {
  return !zone.signals.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlink(
  zone: Zone,
  isOnZoneLevel?: boolean,
  signalIndex?: number,
  axis?: string,
): Zone {
  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel) {
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
    setNbAtoms(zone, axis);
  } else if (axis !== undefined) {
    resetDiaIDs(zone, axis);
    setNbAtoms(zone, axis);
  } else {
    for (const key of ['x', 'y']) {
      resetDiaIDs(zone, key);
      setNbAtoms(zone, key);
    }
  }
  return zone;
}

export function unlinkInAssignmentData(
  assignmentData,
  zones: Partial<Zone>[],
  axis?: string,
): void {
  const ids = zones.flatMap((zone) => {
    if (zone.id) {
      return zone.id;
    }
    if (zone.signals) {
      return zone.signals.map((signal) => signal.id);
    }
    return [];
  });

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

import { DatumKind } from '../constants/SignalsKinds';
import { Zone } from '../data2d/Spectrum2D';

export function getDiaIDs(zone: Zone, axis: string): string[] {
  return ([] as string[]).concat(
    zone[axis].diaIDs || [],
    zone.signals
      ? zone.signals.map((signal) => signal[axis].diaIDs || []).flat()
      : [],
  );
}

export function getNbAtoms(zone: Zone, axis: string) {
  return zone.signals
    ? zone.signals.reduce(
        (sum, signal) =>
          signal[axis].nbAtoms ? sum + signal[axis].nbAtoms : sum,
        0,
      )
    : 0;
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
  zone.signals.forEach((signal) => {
    delete signal[axis].diaIDs;
    delete signal[axis].nbAtoms;
  });
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
    setNbAtoms(zone, axis);
  } else if (axis !== undefined) {
    resetDiaIDs(zone, axis);
    setNbAtoms(zone, axis);
  } else {
    ['x', 'y'].forEach((key) => {
      resetDiaIDs(zone, key);
      setNbAtoms(zone, key);
    });
  }
  return zone;
}

export function unlinkInAssignmentData(
  assignmentData,
  zones: Partial<Zone>[],
  axis?: string,
): void {
  const ids = zones.reduce((acc: string[], zone) => {
    if (zone.id) {
      acc.push(zone.id);
    }
    if (zone.signals) {
      acc = acc.concat(zone.signals.map((signal) => signal.id, []));
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

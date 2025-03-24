import type { Zone } from 'nmr-processing';

import { DATUM_KIND } from '../constants/signalsKinds.js';

function getNbAtoms(zone: Zone, axis: string) {
  let sum = 0;
  if (zone.signals) {
    for (const signal of zone.signals) {
      sum += signal[axis].nbAtoms || 0;
    }
  }
  return sum;
}

function setNbAtoms(zone: Zone, axis: string): void {
  zone[axis].nbAtoms = getNbAtoms(zone, axis);
  if (zone[axis].nbAtoms === 0) {
    delete zone[axis].nbAtoms;
  }
}

function resetDiaIDs(zone: Zone, axis: string) {
  delete zone[axis].diaIDs;
  delete zone[axis].nbAtoms;
  for (const signal of zone.signals) {
    delete signal[axis].diaIDs;
    delete signal[axis].nbAtoms;
  }
  return zone;
}

export function checkZoneKind(zone: Zone): boolean {
  return zone.kind === DATUM_KIND.signal;
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

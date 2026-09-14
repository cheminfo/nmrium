import type { Zone } from '@zakodium/nmr-types';

function resetDiaIDs(zone: Zone, axis: 'x' | 'y') {
  for (const signal of zone.signals) {
    delete signal[axis].diaIDs;
    delete signal[axis].nbAtoms;
  }
  return zone;
}

export function checkZoneKind(zone: Zone): boolean {
  return zone.kind === 'signal';
}

export function unlink(
  zone: Zone,
  signalIndex?: number,
  axis?: 'x' | 'y',
): Zone {
  if (
    axis !== undefined &&
    typeof signalIndex === 'number' &&
    signalIndex !== -1 &&
    zone.signals[signalIndex]
  ) {
    delete zone.signals[signalIndex][axis].diaIDs;
    delete zone.signals[signalIndex][axis].nbAtoms;
  } else if (axis !== undefined) {
    resetDiaIDs(zone, axis);
  } else {
    for (const key of ['x', 'y'] as const) {
      resetDiaIDs(zone, key);
    }
  }
  return zone;
}

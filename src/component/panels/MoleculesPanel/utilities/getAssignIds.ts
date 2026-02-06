import type { Range, Zone } from '@zakodium/nmr-types';
import type { Spectrum } from '@zakodium/nmrium-core';

import { isSpectrum1D } from '../../../../data/data1d/Spectrum1D/isSpectrum1D.js';

interface TargetAssignment {
  key: string;
  index: number;
}

interface RangeTargetAssignKey extends TargetAssignment {
  target: 'range';
}
interface ZoneTargetAssignKey extends TargetAssignment {
  target: 'zone';
}
interface SignalTargetAssignKey extends TargetAssignment {
  target: 'signal';
}
export type TargetAssignKeys =
  | [RangeTargetAssignKey | ZoneTargetAssignKey]
  | [RangeTargetAssignKey | ZoneTargetAssignKey, SignalTargetAssignKey];

export function getAssignIds(
  spectrum: Spectrum,
  id: string,
): TargetAssignKeys | null {
  if (!spectrum) return null;

  const data = getRangesOrZones(spectrum);
  const target = isSpectrum1D(spectrum) ? 'range' : 'zone';

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];

    const signalIndex = datum.signals.findIndex((signal) => signal.id === id);
    if (signalIndex !== -1) {
      const { id } = datum.signals[signalIndex];
      return [
        { target, index: i, key: datum.id },
        { target: 'signal', index: signalIndex, key: id },
      ];
    }
  }

  return null;
}

function getRangesOrZones(spectrum: Spectrum): Array<Range | Zone> {
  if (isSpectrum1D(spectrum)) {
    return spectrum.ranges.values;
  } else {
    return spectrum.zones.values;
  }
}

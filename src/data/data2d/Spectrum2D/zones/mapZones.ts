import { v4 } from '@lukeed/uuid';

import { DatumKind } from '../../../constants/SignalsKinds';
import { MapOptions, ShiftTarget } from '../../../types/common/MapOptions';
import { Datum2D, Zone } from '../../../types/data2d';
import { Signal2D } from '../../../types/data2d/Signal2D';
import { get2DSpectrumErrorValue } from '../get2DSpectrumErrorValue';
import { getShift, Shift2D } from '../getShift';

import { isZoneExists } from './isZoneExists';

function getSignal(signal: Signal2D, shiftTarget: ShiftTarget, shift: Shift2D) {
  const { x, y } = signal;

  if (shiftTarget === 'origin') {
    return {
      ...signal,
      x: {
        ...x,
        originDelta: x.delta - shift.x,
      },
      y: {
        ...y,
        originDelta: y.delta - shift.y,
      },
    };
  } else {
    return {
      ...signal,
      x: {
        ...x,
        delta: x.originDelta + shift.x,
      },
      y: {
        ...y,
        delta: y.originDelta + shift.y,
      },
    };
  }
}

export function mapZones(
  zones: Zone[],
  datum: Datum2D,
  options: MapOptions = {},
) {
  const { checkIsExisting = true, shiftTarget = 'origin' } = options;
  const shift = getShift(datum);
  const error = get2DSpectrumErrorValue(datum);

  let _zones: Zone[] = zones;

  if (checkIsExisting) {
    _zones = zones.filter((zone) => !isZoneExists(zone, datum, error));
  }

  return _zones.map((zone: Zone) => {
    const x = zone.x || { from: 0, to: 0 };
    const y = zone.y || { from: 0, to: 0 };

    const signals = zone.signals.map((signal) => {
      const { id, kind } = signal;
      return {
        ...getSignal(signal, shiftTarget, shift),
        id: id || v4(),
        kind: kind || 'signal',
      };
    });

    return {
      id: zone.id || v4(),
      x: { from: x.from, to: x.to },
      y: { from: y.from, to: y.to },
      signals,
      kind: zone.kind || DatumKind.signal,
    };
  });
}

import { Datum2D } from '../../../types/data2d';

import { getShift } from './getShift';

export function updateShift(datum: Datum2D) {
  const { xShift, yShift } = getShift(datum);
  updateZonesShift(datum, {
    xShift,
    yShift,
  });
}

function updateZonesShift(datum: Datum2D, { xShift, yShift }) {
  datum.zones.values = datum.zones.values.map((zone) => ({
    ...zone,
    signals: zone.signals?.map((signal) => ({
      ...signal,
      x: { ...signal.x, delta: signal.x.originDelta + xShift },
      y: { ...signal.y, delta: signal.y.originDelta + yShift },
    })),
  }));
}

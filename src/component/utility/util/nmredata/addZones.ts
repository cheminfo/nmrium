import { v4 } from '@lukeed/uuid';

import { getShift } from '../../../../data/data2d/Spectrum2D';

const axisLabels = ['y', 'x'];

export function addZones(signals, datum) {
  let zones: Array<any> = [];
  const shift = getShift(datum);
  const { baseFrequency } = datum.info;
  const frequency = { x: baseFrequency[0], y: baseFrequency[1] };

  for (const signal of signals) {
    let zone = { x: {}, y: {}, id: v4(), kind: 'signal' };
    let signalFormated = { id: v4(), kind: 'signal', peaks: [] };
    let width = { x: 10, y: 10 };
    for (let axis of axisLabels) {
      let { coupling = [], delta, diaIDs = [] } = signal[axis];
      for (let j of coupling) {
        width[axis] += j.coupling;
      }
      if (signal.activeCoupling) {
        const { activeCoupling = [] } = signal;
        for (let j of activeCoupling) {
          width[axis] += j.coupling;
        }
      }
      width[axis] /= frequency[axis];

      zone[axis] = {
        from: delta - width[axis],
        to: delta + width[axis],
      };

      signalFormated[axis] = {
        delta,
        diaIDs,
        originDelta: delta - shift[`${axis}Shift`],
      };
    }
    zones.push({
      ...zone,
      signals: [signalFormated],
    });
  }
  datum.zones.values = zones;
}

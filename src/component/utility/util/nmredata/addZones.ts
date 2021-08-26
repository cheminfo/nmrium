import { getShift } from '../../../../data/data2d/Spectrum2D';
import generateID from '../../../../data/utilities/generateID';

const axisLabels = ['x', 'y'];

export function addZones(signals, datum) {
  let zones: Array<any> = [];
  const shift = getShift(datum);
  const { baseFrequency } = datum.info;
  const frequency = { x: baseFrequency[0], y: baseFrequency[1] };

  for (const signal of signals) {
    let zone = { x: {}, y: {}, id: generateID(), kind: 'signal' };
    let signalFormated = { id: generateID(), kind: 'signal', peak: [] };
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
      signal: [signalFormated],
    });
  }
  datum.zones.values = zones;
}

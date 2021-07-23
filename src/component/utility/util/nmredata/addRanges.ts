import { mapRanges } from '../../../../data/data1d/Spectrum1D';

export function addRanges(signals, datum) {
  let ranges: Array<any> = [];
  const { baseFrequency: frequency = 500 } = datum;
  for (const signal of signals) {
    const { jCoupling: j, delta, diaID = [], multiplicity, integral } = signal;
    const fromTo = computeFromTo({ delta, j, frequency });
    ranges.push({
      ...fromTo,
      integral,
      signal: [
        {
          j,
          delta,
          diaID,
          multiplicity,
        },
      ],
    });
  }
  datum.ranges.values = mapRanges(joinRanges(ranges), datum);
}

interface ComputeFromToOptions {
  delta?: any;
  j?: any;
  couplings?: Array<any>;
  frequency?: any;
}

function computeFromTo(options: ComputeFromToOptions = {}) {
  const { delta, j: couplings = [], frequency } = options;
  let width = 0.5;
  for (let j of couplings) {
    width += j.coupling;
  }
  width /= frequency;
  return { from: delta - width, to: delta + width };
}

function joinRanges(ranges) {
  ranges.sort((a, b) => a.from - b.from);
  for (let i = 0; i < ranges.length - 1; i++) {
    if (ranges[i].to > ranges[i + 1].from) {
      ranges[i].to = Math.max(ranges[i + 1].to, ranges[i].to);
      ranges[i].signals = ranges[i].signals.concat(ranges[i + 1].signals);
      ranges[i].integration += ranges[i + 1].integration;
      ranges.splice(i + 1, 1);
      i--;
    }
  }
  return ranges;
}

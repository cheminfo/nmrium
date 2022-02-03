import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

const MAX_LENGTH = 2048;

export default function detectSignal(
  x: Float64Array,
  re: Float64Array,
  from,
  to,
  frequency,
  alert: any,
) {
  const { fromIndex, toIndex } = xGetFromToIndex(x, {
    from: from,
    to: to,
  });
  if (toIndex - fromIndex < MAX_LENGTH) {
    const data = {
      x: x.subarray(fromIndex, toIndex),
      y: re.subarray(fromIndex, toIndex),
    };

    const result = analyseMultiplet(data, {
      frequency: frequency,
      takeBestPartMultiplet: true,
      symmetrizeEachStep: true,
    });
    if (result && result.chemShift === undefined) return;
    return {
      multiplicity: result.js.map((j) => j.multiplicity).join(''),
      kind: 'signal',
      delta: result.chemShift,
      js: result.js,
    };
  } else {
    alert.error(
      `Advanced peak picking only available for area up to ${MAX_LENGTH} points`,
    );
  }
}

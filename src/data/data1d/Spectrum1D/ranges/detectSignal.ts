import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

export const MAX_LENGTH = 2048;

export default function detectSignal(
  data: { x: Float64Array; re: Float64Array },
  options: {
    from: number;
    to: number;
    frequency: number;
    checkMaxLength?: boolean;
  },
) {
  const { x, re } = data;
  const { from, to, frequency, checkMaxLength = true } = options;
  const { fromIndex, toIndex } = xGetFromToIndex(x, {
    from,
    to,
  });

  if (
    !checkMaxLength ||
    (checkMaxLength && toIndex - fromIndex <= MAX_LENGTH)
  ) {
    const data = {
      x: x.slice(fromIndex, toIndex),
      y: re.slice(fromIndex, toIndex),
    };

    const result = analyseMultiplet(data, {
      frequency,
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
    throw new Error(`length of signal should not exceed ${MAX_LENGTH} points`);
  }
}

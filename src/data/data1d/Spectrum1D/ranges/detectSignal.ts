import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';
import { xyAutoPeaksPicking } from 'nmr-processing';

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

    const signal = {
      multiplicity: result.js.map((j) => j.multiplicity).join(''),
      kind: 'signal',
      delta: result.chemShift,
      js: result.js,
      diaIDs: [],
    };

    if (result.js.length === 0) {
      const { x: xData } = data;
      const { chemShift: delta } = result;
      const peakList = xyAutoPeaksPicking(data, { frequency });
      const deltaX = xData[0] - xData[1];
      const peaks = peakList.filter(
        (peak) => peak.x < delta - deltaX && peak.x > delta + deltaX,
      );
      if (peaks.length === 1) signal.multiplicity = 's';
    }
    return signal;
  } else {
    throw new Error(`length of signal should not exceed ${MAX_LENGTH} points`);
  }
}

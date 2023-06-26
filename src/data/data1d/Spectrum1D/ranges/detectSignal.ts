import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';
import { signalJoinCouplings, xyAutoPeaksPicking } from 'nmr-processing';

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
    const dataRoi = {
      x: x.slice(fromIndex, toIndex),
      y: re.slice(fromIndex, toIndex),
    };

    const result = analyseMultiplet(dataRoi, {
      frequency,
      minimalResolution: 0.3,
      maxTestedJ: 17,
      checkSymmetryFirst: true,
      takeBestPartMultiplet: true,
      correctVerticalOffset: true,
      symmetrizeEachStep: false,
      decreasingJvalues: true,
      makeShortCutForSpeed: true,
    });

    if (result && result.chemShift === undefined) return;

    const { delta, js } = joinCouplings(result);

    let cs = 0;
    let area = 0;
    for (let i = 0; i < dataRoi.x.length; i++) {
      cs += dataRoi.x[i] * dataRoi.y[i];
      area += dataRoi.y[i];
    }
    cs /= area;

    const peakList =
      js.length === 0 ? xyAutoPeaksPicking(dataRoi, { frequency }) : [];

    return {
      multiplicity:
        js.length > 0
          ? js.map((j) => j.multiplicity).join('')
          : Math.abs(cs - delta) / cs < 1e-3
          ? peakList.length === 1
            ? 's'
            : 'm'
          : 'm',
      kind: 'signal',
      delta: cs,
      js,
      diaIDs: [],
    };
  } else {
    throw new Error(`length of signal should not exceed ${MAX_LENGTH} points`);
  }
}

function joinCouplings(result: any) {
  const { chemShift: delta, js } = result;
  let jCouplings = js;
  if (js.length > 1) {
    try {
      jCouplings = signalJoinCouplings(
        {
          delta,
          js,
        },
        { tolerance: 0.6, ignoreDiaIDs: true },
      ).js;
    } catch (error) {
      reportError(error);
    }
  }
  return {
    delta,
    js: jCouplings,
  };
}

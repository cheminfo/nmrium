import { DataXY } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';
import {
  NMRPeak1DWithShapeID,
  signalJoinCouplings,
  xyAutoPeaksPicking,
  xyAutoRangesPicking,
} from 'nmr-processing';

const MAX_LENGTH = 4092;
export default function detectSignals(
  data: DataXY,
  options: {
    from: number;
    to: number;
    nucleus: string;
    frequency: number;
  },
) {
  const { from, to, frequency, nucleus } = options;

  const { fromIndex, toIndex } = xGetFromToIndex(data.x, { from, to });
  if (toIndex - fromIndex >= MAX_LENGTH) {
    const ranges = xyAutoRangesPicking(data, {
      peakPicking: {
        to,
        from,
        frequency,
      },
      ranges: {
        symRatio: 2.5,
        frequency,
        nucleus,
        compile: true,
        frequencyCluster: 16,
        keepPeaks: true,
        clean: 0.3,
      },
    });
    return ranges
      .flatMap((r) => r.signals || [])
      .map((s) => ({ multiplicity: '', js: [], ...s }));
  } else {
    return detectSignalsByMultipletAnalysis(data, {
      ...options,
      fromIndex,
      toIndex,
    });
  }
}

function detectSignalsByMultipletAnalysis(data: DataXY, options: any) {
  const { fromIndex, toIndex, frequency } = options;
  const dataRoi = {
    x: data.x.slice(fromIndex, toIndex),
    y: data.y.slice(fromIndex, toIndex),
  };

  const result = analyseMultiplet(dataRoi, {
    frequency,
    minimalResolution: 0.1,
    maxTestedJ: 17,
    checkSymmetryFirst: true,
    takeBestPartMultiplet: true,
    correctVerticalOffset: true,
    symmetrizeEachStep: false,
    decreasingJvalues: true,
    makeShortCutForSpeed: true,
  });

  if (result && result.chemShift === undefined) return [];

  const { delta, js } = joinCouplings(result);

  let cs = 0;
  let area = 0;
  for (let i = 0; i < dataRoi.x.length; i++) {
    cs += dataRoi.x[i] * dataRoi.y[i];
    area += dataRoi.y[i];
  }
  cs /= area;

  const peaks = xyAutoPeaksPicking(dataRoi, { frequency });

  const multiplicity = getMultiplicity(js, { cs, delta, peaks });

  return [
    {
      multiplicity,
      kind: 'signal',
      delta: cs,
      js,
      peaks,
      diaIDs: [],
    },
  ];
}

function getMultiplicity(
  js,
  options: { cs: number; delta: number; peaks: NMRPeak1DWithShapeID[] },
) {
  const { cs, delta, peaks } = options;

  if (js?.length > 0) {
    return js.map((j) => j.multiplicity).join('');
  }
  //check if the massive center is closer to the shift from multiplet-analysis,
  //if true, is it possibly a singlet.
  return peaks.length === 1 && Math.abs(cs - delta) / cs < 1e-3 ? 's' : 'm';
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

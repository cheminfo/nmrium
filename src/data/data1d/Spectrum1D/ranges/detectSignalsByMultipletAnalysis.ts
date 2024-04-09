import { DataXY } from 'cheminfo-types';
import { optimizePeaksWithLogs } from 'ml-gsd';
import { xMaxValue } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';
import {
  NMRPeak1DWithShapeID,
  signalJoinCouplings,
  xyAutoPeaksPicking,
} from 'nmr-processing';

import { getMassCenter } from './utils/getMassCenter';

export function detectSignalsByMultipletAnalysis(
  data: DataXY<Float64Array>,
  options: any,
) {
  const { fromIndex, toIndex, frequency } = options;
  const dataRoi = {
    x: data.x.slice(fromIndex, toIndex),
    y: data.y.slice(fromIndex, toIndex),
  };
  const from = data.x[fromIndex];
  const to = data.x[toIndex];

  const peaks = xyAutoPeaksPicking(data, {
    from,
    to,
    frequency,
    minMaxRatio: 0.1,
    broadWidth: 0.25,
    broadRatio: 0.0025,
    optimize: true,
    smoothY: true,
  });

  if (peaks.length === 0) {
    return [];
  }

  const cs = getMassCenter({
    x: peaks.map((p) => p.x),
    y: peaks.map((p) => p.y),
  });

  const initialWidth = Math.abs(peaks[0].x - (peaks.at(-1) || peaks[0]).x);
  const { logs, optimizedPeaks } = optimizePeaksWithLogs(
    dataRoi,
    [
      {
        x: cs,
        y: xMaxValue(dataRoi.y),
        width: initialWidth,
        parameters: {
          width: { max: initialWidth * 4, min: initialWidth * 0.8 },
        },
      },
    ],
    { shape: { kind: 'pseudoVoigt' }, optimization: { kind: 'lm' } },
  );

  const log = logs.find((l) => l.message === 'optimization successful');

  if (log) {
    const { error } = log;
    if (error < 0.2) {
      return [
        {
          multiplicity: 's',
          kind: 'signal',
          delta: cs,
          js: [],
          peaks: optimizedPeaks,
          diaIDs: [],
        },
      ];
    }
  }

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

  const { jCouplings, multiplicity } = getMultiplicity(js, peaks);
  return [
    {
      multiplicity,
      kind: 'signal',
      delta,
      js: jCouplings,
      peaks,
      diaIDs: [],
    },
  ];
}

function getMultiplicity(
  js: Array<{ value: number; multiplicity: 'string' }>,
  peaks: NMRPeak1DWithShapeID[],
) {
  if (peaks.length > 1) {
    if (js?.length > 0) {
      return {
        jCouplings: js,
        multiplicity: js.map((j) => j.multiplicity).join(''),
      };
    }
    return {
      jCouplings: [],
      multiplicity: 'm',
    };
  }

  if (peaks.length === 1) {
    return {
      jCouplings: [],
      multiplicity: js.length > 0 ? 'br s' : 's',
    };
  } else {
    return {
      jCouplings: [],
      multiplicity: 'm',
    };
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

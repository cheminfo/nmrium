import { Datum1D } from '../../../types/data1d/Datum1D';
import { initSumOptions, SumParams } from '../SumHelper';

import autoRangesDetection from './autoRangesDetection';
import { mapRanges } from './mapRanges';
import { updateRangesRelativeValues } from './updateRangesRelativeValues';

interface DetectRangesOptions {
  windowFromIndex?: number;
  windowToIndex?: number;
  peakPicking: {
    factorStd: number; // default 8
    minMaxRatio: number; // default 0.1
    nH: number; // default 100
    compile: boolean; //default true
    frequencyCluster: number; // default 16
    clean: boolean; // default true
    keepPeaks: boolean; //default true
  };
  impurities?: {
    solvent: string;
  };
}

export function detectRanges(
  datum: Datum1D,
  options: DetectRangesOptions & SumParams,
) {
  const { molecules, nucleus, ...detectOptions } = options;
  detectOptions.impurities = { solvent: datum.info.solvent || '' };
  const ranges = autoRangesDetection(datum, detectOptions);
  datum.ranges.options = initSumOptions(datum.ranges.options, {
    molecules,
    nucleus,
  });
  datum.ranges.values = datum.ranges.values.concat(mapRanges(ranges, datum));
  updateRangesRelativeValues(datum);
}

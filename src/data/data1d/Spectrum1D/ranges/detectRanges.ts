import { Spectrum1D } from 'nmr-load-save';
import { updateRangesRelativeValues, mapRanges } from 'nmr-processing';

import { initSumOptions, SumParams } from '../SumManager';

import autoRangesDetection from './autoRangesDetection';

interface DetectRangesOptions {
  windowFromIndex?: number;
  windowToIndex?: number;
  rangePicking: {
    integrationSum?: number; // default 100
    compile?: boolean; //default true
    frequencyCluster?: number; // default 16
    clean?: number; // default 0.3
    keepPeaks?: boolean; //default true
  };
  peakPicking: {
    thresholdFactor?: number; // default 8
    minMaxRatio?: number; // default 0.1
    direction?: 'negative' | 'positive' | 'both'; //default positive
  };
  impurities?: {
    solvent: string;
  };
}

export function detectRanges(
  spectrum: Spectrum1D,
  options: DetectRangesOptions & SumParams,
) {
  const { molecules, nucleus, ...detectOptions } = options;
  detectOptions.impurities = { solvent: spectrum.info.solvent || '' };
  const ranges = autoRangesDetection(spectrum, detectOptions);
  spectrum.ranges.options = initSumOptions(spectrum.ranges.options, {
    molecules,
    nucleus,
  });
  spectrum.ranges.values = spectrum.ranges.values.concat(
    mapRanges(ranges, spectrum),
  );
  updateRangesRelativeValues(spectrum);
}

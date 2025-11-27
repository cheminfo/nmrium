import type { Spectrum1D } from '@zakodium/nmrium-core';
import { mapRanges, updateRangesRelativeValues } from 'nmr-processing';

import { isProton } from '../../../utilities/isProton.ts';
import type { SumParams } from '../SumManager.js';
import { initSumOptions } from '../SumManager.js';

import type { AutoRangesDetectionOptions } from './autoRangesDetection.js';
import { autoRangesDetection } from './autoRangesDetection.js';

export interface DetectRangesOptions {
  windowFromIndex?: number;
  windowToIndex?: number;
  rangePicking: Exclude<AutoRangesDetectionOptions['rangePicking'], undefined>;
  peakPicking: Exclude<AutoRangesDetectionOptions['peakPicking'], undefined>;
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

  spectrum.ranges.options = initSumOptions(spectrum.ranges.options, {
    molecules,
    nucleus,
  });

  if (isProton(nucleus)) {
    detectOptions.rangePicking.integrationSum = spectrum.ranges.options.sum;
  }

  const ranges = autoRangesDetection(spectrum, detectOptions);
  spectrum.ranges.values = spectrum.ranges.values.concat(
    mapRanges(ranges, spectrum),
  );
  updateRangesRelativeValues(spectrum);
}

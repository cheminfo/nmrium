import type { Zone } from '@zakodium/nmr-types';
import type { Spectrum2D } from '@zakodium/nmrium-core';
import { mapZones } from 'nmr-processing';

import type { DetectionZonesOptions } from './getDetectionZones.js';
import { getDetectionZones } from './getDetectionZones.js';

type DetectZonesManualOptions = Pick<
  DetectionZonesOptions,
  'selectedZone' | 'thresholdFactor' | 'maxPercentCutOff'
>;

/**
 *
 * @param spectrum
 * @param options
 */
export function detectZonesManual(
  spectrum: Spectrum2D,
  options: DetectZonesManualOptions,
): Zone[] {
  const { spectralWidth, originFrequency } = spectrum.info;
  const zones = getDetectionZones(spectrum, {
    ...options,
    tolerances: spectralWidth.map((sw, i) => sw * originFrequency[i]),
  });
  let { fromX, fromY, toX, toY } = options.selectedZone;
  if (fromX > toX) [fromX, toX] = [toX, fromX];
  if (fromX > toX) [fromY, toY] = [toY, fromY];
  zones[0] = {
    ...zones[0],
    x: { from: fromX, to: toX },
    y: { from: fromY, to: toY },
  };

  return mapZones(zones, spectrum);
}

import type { Spectrum2D, SpectrumTwoDimensionsColor } from 'nmr-load-save';
import { Filters2DManager } from 'nmr-processing';

import type { UsedColors } from '../../../types/UsedColors.js';
import { initiateFilters } from '../../initiateFilters.js';

import {
  DEFAULT_CONTOURS_OPTIONS,
  getDefaultContoursLevel,
} from './contours.js';
import { get2DColor } from './get2DColor.js';
import { initiateZones } from './zones/initiateZones.js';

const defaultMinMax = { z: [], minX: 0, minY: 0, maxX: 0, maxY: 0 };

export interface InitiateDatum2DOptions {
  usedColors?: UsedColors;
  colors?: SpectrumTwoDimensionsColor[];
}

export function initiateDatum2D(
  spectrum: any,
  options: InitiateDatum2DOptions = {},
): Spectrum2D {
  const { usedColors, colors } = options;
  const datum: any = { ...spectrum };

  datum.id = spectrum.id || crypto.randomUUID();

  datum.display = {
    isPositiveVisible: true,
    isNegativeVisible: true,
    isVisible: true,
    contourOptions:
      'rr' in spectrum.data
        ? getDefaultContoursLevel(spectrum)
        : DEFAULT_CONTOURS_OPTIONS,
    dimension: 2,
    ...spectrum.display,
    ...get2DColor(spectrum, { usedColors, colors }),
  };

  datum.info = {
    nucleus: ['1H', '1H'],
    isFt: true,
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 2,
    ...spectrum.info,
  };

  datum.originalInfo = datum.info;

  datum.meta = { ...spectrum.meta };

  datum.customInfo = { ...spectrum.customInfo };

  datum.data = getData(datum, spectrum);
  datum.originalData = datum.data;
  datum.filters = initiateFilters(spectrum?.filters);

  datum.zones = initiateZones(spectrum, datum as Spectrum2D);

  //reapply filters after load the original data
  Filters2DManager.reapplyFilters(datum);

  return datum;
}

function getData(datum, options) {
  if (datum.info.isFid) {
    const { re = defaultMinMax, im = defaultMinMax } = options.data;
    return { re, im };
  }
  return { rr: defaultMinMax, ...options.data };
}

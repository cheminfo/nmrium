import type {
  Spectrum2D,
  SpectrumTwoDimensionsColor,
} from '@zakodium/nmrium-core';
import { Filters2DManager } from 'nmr-processing';

import type { UsedColors } from '../../../types/UsedColors.js';
import { initiateFilters } from '../../initiateFilters.js';

import { get2DColor } from './get2DColor.js';
import { initiateZones } from './zones/initiateZones.js';

const defaultMinMax = { z: [], minX: 0, minY: 0, maxX: 0, maxY: 0 };

interface InitiateDatum2DOptions {
  usedColors?: UsedColors;
  colors?: SpectrumTwoDimensionsColor[];
}

function initiateDisplay(spectrum: any, options: InitiateDatum2DOptions) {
  return {
    isPositiveVisible: true,
    isNegativeVisible: true,
    isVisible: true,
    dimension: 2,
    ...spectrum.display,
    ...get2DColor(spectrum, options),
  };
}

function initiateInfo(spectrum: any) {
  return {
    nucleus: ['1H', '1H'],
    isFt: true,
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 2,
    ...spectrum.info,
  };
}

export function initiateDatum2D(
  spectrum: any,
  options: InitiateDatum2DOptions = {},
): Spectrum2D {
  const { usedColors, colors } = options;
  const datum: Spectrum2D = {
    ...spectrum,
    id: spectrum.id || crypto.randomUUID(),
    display: initiateDisplay(spectrum, { usedColors, colors }),
    info: initiateInfo(spectrum),
  };

  datum.originalInfo = datum.info;

  datum.meta = { ...spectrum.meta };

  datum.customInfo = { ...spectrum.customInfo };

  datum.data = getData(datum, spectrum);
  datum.originalData = datum.data;
  datum.filters = initiateFilters(spectrum?.filters);

  datum.zones = initiateZones(spectrum, datum);

  //reapply filters after load the original data
  Filters2DManager.reapplyFilters(datum);

  // datum.display.contourOptions = initializeSpectrumContoursOptions(datum);

  return datum;
}

function getData(datum: any, options: any) {
  if (datum.info.isFid) {
    const { re = defaultMinMax, im = defaultMinMax } = options.data;
    return { re, im };
  }
  return { rr: defaultMinMax, ...options.data };
}

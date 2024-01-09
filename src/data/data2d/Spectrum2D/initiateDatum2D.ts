import { v4 } from '@lukeed/uuid';
import { Spectrum2D, SpectrumTwoDimensionsColor } from 'nmr-load-save';
import { FiltersManager } from 'nmr-processing';

import { UsedColors } from '../../../types/UsedColors';
import { initiateFilters } from '../../initiateFilters';

import { DEFAULT_CONTOURS_OPTIONS } from './contours';
import { get2DColor } from './get2DColor';
import { initiateZones } from './zones/initiateZones';

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

  datum.id = spectrum.id || v4();

  datum.display = {
    isPositiveVisible: true,
    isNegativeVisible: true,
    isVisible: true,
    contourOptions: DEFAULT_CONTOURS_OPTIONS,
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
  FiltersManager.reapplyFilters(datum);

  return datum;
}

function getData(datum, options) {
  if (datum.info.isFid) {
    const { re = defaultMinMax, im = defaultMinMax } = options.data;
    return { re, im };
  }
  return { rr: defaultMinMax, ...options.data };
}

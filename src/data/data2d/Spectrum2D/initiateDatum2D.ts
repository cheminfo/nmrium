import { v4 } from '@lukeed/uuid';

import * as FiltersManager from '../../FiltersManager';
import { Datum2D } from '../../types/data2d/Datum2D';
import { get2DColor } from '../../utilities/getColor';

import { DEFAULT_CONTOURS_OPTIONS } from './contours';
import { initiateZones } from './zones/initiateZones';

const defaultMinMax = { z: [], minX: 0, minY: 0, maxX: 0, maxY: 0 };

export function initiateDatum2D(options: any, usedColors = {}): Datum2D {
  const datum: any = {};

  datum.id = options.id || v4();
  datum.source = {
    jcampURL: null,
    ...options.source,
  };
  datum.display = {
    name: options.display?.name || v4(),
    ...getColor(options, usedColors),
    isPositiveVisible: true,
    isNegativeVisible: true,
    isVisible: true,
    contourOptions: DEFAULT_CONTOURS_OPTIONS,
    dimension: 2,
    ...options.display,
  };

  datum.info = {
    nucleus: ['1H', '1H'],
    isFt: true,
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 2,
    ...options.info,
  };

  datum.originalInfo = datum.info;
  datum.meta = { ...options.meta };

  datum.data = getData(datum, options);
  datum.originalData = datum.data;
  datum.filters = Object.assign([], options.filters);

  datum.zones = initiateZones(options, datum as Datum2D);

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  return datum;
}

function getData(datum, options) {
  if (datum.info.isFid) {
    const { re = defaultMinMax, im = defaultMinMax } = options.data;
    return { rr: re, ii: im };
  }
  return { rr: defaultMinMax, ...options.data };
}

function getColor(options, usedColors) {
  let color = { positiveColor: 'red', negativeColor: 'blue' };
  if (
    options?.display?.negativeColor === undefined ||
    options?.display?.positiveColor === undefined
  ) {
    color = get2DColor(options.info.experiment, usedColors['2d'] || []);
  }

  if (usedColors['2d']) {
    usedColors['2d'].push(color.positiveColor);
  }
  return color;
}

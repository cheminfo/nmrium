import { v4 } from '@lukeed/uuid';

import * as FiltersTypes from '../../Filters';
import * as FiltersManager from '../../FiltersManager';
import { Datum1D } from '../../types/data1d/Datum1D';

import { convertDataToFloat64Array } from './convertDataToFloat64Array';
import { get1DColor } from './get1DColor';
import { initiateIntegrals } from './integrals/initiateIntegrals';
import { initiatePeaks } from './peaks/initiatePeaks';
import { initiateRanges } from './ranges/initiateRanges';

export function initiateDatum1D(options: any, usedColors = {}): Datum1D {
  const datum: Partial<Datum1D> = {};
  datum.id = options.id || v4();
  datum.source = options?.source || {};

  datum.display = {
    name: options.display?.name || v4(),
    isVisible: true,
    isRealSpectrumVisible: true,
    ...options.display,
    ...get1DColor(options, usedColors),
  };

  datum.info = {
    nucleus: '1H', // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
    ...options.info,
  };

  datum.originalInfo = datum.info;

  datum.meta = { ...options.meta };

  datum.metaInfo = { ...options.metaInfo };

  datum.data = convertDataToFloat64Array(options.data);

  datum.originalData = datum.data;

  datum.filters = Object.assign([], options.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }

  datum.peaks = initiatePeaks(options, datum as Datum1D);

  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  datum.integrals = initiateIntegrals(options, datum as Datum1D); // array of object (from: xIndex, to: xIndex)
  datum.ranges = initiateRanges(options, datum as Datum1D);

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  preprocessing(datum);
  return datum as Datum1D;
}

function preprocessing(datum) {
  if (
    datum.info.isFid &&
    datum.filters.findIndex((f) => f.name === FiltersTypes.digitalFilter.id) ===
      -1 &&
    datum.info.digitalFilter
  ) {
    FiltersManager.applyFilter(datum, [
      {
        name: FiltersTypes.digitalFilter.id,
        options: {
          digitalFilterValue: datum.info.digitalFilter,
        },
        isDeleteAllow: false,
      },
    ]);
  }
}

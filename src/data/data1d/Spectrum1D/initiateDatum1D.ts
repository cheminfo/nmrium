import { v4 } from '@lukeed/uuid';

import { UsedColors } from '../../../types/UsedColors';
import * as Filters from '../../Filters';
import * as FiltersManager from '../../FiltersManager';
import { Datum1D } from '../../types/data1d/Datum1D';

import { convertDataToFloat64Array } from './convertDataToFloat64Array';
import { get1DColor } from './get1DColor';
import { initiateIntegrals } from './integrals/initiateIntegrals';
import { initiatePeaks } from './peaks/initiatePeaks';
import { initiateRanges } from './ranges/initiateRanges';

export interface InitiateDatum1DOptions {
  usedColors?: UsedColors;
  filters?: any[];
}

export function initiateDatum1D(
  spectrum: any,
  options: InitiateDatum1DOptions = {},
): Datum1D {
  const { usedColors = {}, filters = [] } = options;

  const datum: Partial<Datum1D> = {};
  datum.id = spectrum.id || v4();
  datum.selector = spectrum?.selector || {};

  datum.display = {
    isVisible: true,
    isRealSpectrumVisible: true,
    ...spectrum.display,
    ...get1DColor(spectrum, usedColors),
  };

  datum.info = {
    nucleus: '1H', // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
    ...spectrum.info,
  };

  datum.originalInfo = datum.info;

  datum.meta = { ...spectrum.meta };

  datum.metaInfo = { ...spectrum.metaInfo };

  datum.data = convertDataToFloat64Array(spectrum.data);

  datum.originalData = datum.data;

  datum.filters = Object.assign([], spectrum.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }

  datum.peaks = initiatePeaks(spectrum, datum as Datum1D);

  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  datum.integrals = initiateIntegrals(spectrum, datum as Datum1D); // array of object (from: xIndex, to: xIndex)
  datum.ranges = initiateRanges(spectrum, datum as Datum1D);

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(datum);

  preprocessing(datum, filters);
  return datum as Datum1D;
}

function preprocessing(datum, onLoadFilters: FiltersManager.BaseFilter[] = []) {
  if (datum.info.isFid) {
    if (onLoadFilters?.length === 0) {
      FiltersManager.applyFilter(datum, [
        {
          name: Filters.digitalFilter.id,
          value: {},
          isDeleteAllow: false,
        },
      ]);
    } else {
      const filters: FiltersManager.BaseFilter[] = [];

      for (let filter of onLoadFilters) {
        if (
          (!datum.info?.digitalFilter &&
            filter.name === Filters.digitalFilter.id) ||
          !filter.flag
        ) {
          continue;
        }

        if (filter.name === Filters.digitalFilter.id) {
          filter = { ...filter, isDeleteAllow: false };
        }

        filters.push(filter);
      }

      FiltersManager.applyFilter(datum, filters);
    }
  }
}

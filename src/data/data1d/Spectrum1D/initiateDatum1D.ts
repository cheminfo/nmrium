import { v4 } from '@lukeed/uuid';
import { Spectrum1D } from 'nmr-load-save';

import { UsedColors } from '../../../types/UsedColors';
import * as Filters from '../../Filters';
import * as FiltersManager from '../../FiltersManager';

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
): Spectrum1D {
  const { usedColors = {}, filters = [] } = options;

  const spectrumObj: Partial<Spectrum1D> = {};
  spectrumObj.id = spectrum.id || v4();

  spectrumObj.display = {
    isVisible: true,
    isRealSpectrumVisible: true,
    ...spectrum.display,
    ...get1DColor(spectrum, usedColors),
  };

  spectrumObj.info = {
    nucleus: '1H', // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
    ...spectrum.info,
  };

  spectrumObj.originalInfo = spectrumObj.info;

  spectrumObj.meta = { ...spectrum.meta };

  spectrumObj.metaInfo = { ...spectrum.metaInfo };

  spectrumObj.data = convertDataToFloat64Array(spectrum.data);

  spectrumObj.originalData = spectrumObj.data;

  spectrumObj.filters = Object.assign([], spectrum.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }

  spectrumObj.peaks = initiatePeaks(spectrum, spectrumObj as Spectrum1D);

  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  spectrumObj.integrals = initiateIntegrals(
    spectrum,
    spectrumObj as Spectrum1D,
  ); // array of object (from: xIndex, to: xIndex)
  spectrumObj.ranges = initiateRanges(spectrum, spectrumObj as Spectrum1D);

  //reapply filters after load the original data
  FiltersManager.reapplyFilters(spectrumObj);

  preprocessing(spectrumObj, filters);
  return spectrumObj as Spectrum1D;
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

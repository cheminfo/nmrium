/* eslint-disable import/namespace */
import { v4 } from '@lukeed/uuid';

import * as Filters from './Filters';
import { cloneDatum1D } from './data1d/Spectrum1D/cloneDatum1D';
import { updateIntegrals } from './data1d/Spectrum1D/integrals/updateIntegrals';
import { updatePeaks } from './data1d/Spectrum1D/peaks/updatePeaks';
import { updateRanges } from './data1d/Spectrum1D/ranges/updateRanges';
import { cloneDatum2D } from './data2d/Spectrum2D/cloneDatum2D';
import { updateZones } from './data2d/Spectrum2D/zones/updateZones';
import { Datum1D } from './types/data1d';
import { Datum2D } from './types/data2d/Datum2D';

export interface BaseFilter {
  name: string;
  value: any;
  isDeleteAllow?: boolean;
  flag?: boolean;
  label?: string;
}
export interface Filter extends Required<BaseFilter> {
  id: string;
}

function resetDataToOrigin(datum) {
  datum.data =
    datum.info.dimension === 1
      ? cloneDatum1D(datum.originalData)
      : cloneDatum2D(datum.originalData);

  datum.info = { ...datum.originalInfo };
}
// update the the part of the data that affected by applying the filters
function updateData(datum: Datum1D | Datum2D) {
  if (datum.info.dimension === 1) {
    updatePeaks(datum as Datum1D);
    updateRanges(datum as Datum1D);
    updateIntegrals(datum as Datum1D);
  } else if (datum.info.dimension === 2) {
    updateZones(datum as Datum2D);
  }
}

function applyFilter(
  datum: Datum1D | Datum2D,
  filters: BaseFilter[] = [],
  forceReapply = false,
) {
  let isReduced = false;
  for (let filter of filters) {
    const filterOption = {
      name: filter.name,
      label: Filters[filter.name].name,
      value: filter.value,
    };
    const previousFilter = lookupForFilter(datum, filter.name);
    if (previousFilter) {
      // eslint-disable-next-line unicorn/no-array-reduce
      const reduceResult = Filters[filter.name].reduce(
        previousFilter.value,
        filterOption.value,
      );
      if (reduceResult.once) {
        if (!isReduced) {
          isReduced = true;
        }
        if (reduceResult.reduce != null && reduceResult.reduce !== undefined) {
          replaceFilter(datum, previousFilter.id, reduceResult.reduce);
        }
      } else {
        addFilter(
          datum,
          filterOption,
          Object.prototype.hasOwnProperty.call(filter, 'isDeleteAllow')
            ? filter.isDeleteAllow
            : true,
        );
      }
    } else {
      addFilter(
        datum,
        filterOption,
        Object.prototype.hasOwnProperty.call(filter, 'isDeleteAllow')
          ? filter.isDeleteAllow
          : true,
      );
    }
  }
  if (forceReapply) {
    reapplyFilters(datum);
  } else if (isReduced) {
    if (filters.length === 1 && isLastFilter(datum, filters[0].name)) {
      Filters[filters[0].name].apply(datum, filters[0].value);
    } else {
      reapplyFilters(datum);
    }
  } else {
    for (let filter of filters) {
      Filters[filter.name].apply(datum, filter.value);
    }
  }
  updateData(datum);
}

function isLastFilter(datum, id) {
  const index = datum.filters.findIndex((f) => f.name === id);
  if (datum.filters.length === index + 1) {
    return true;
  }
  return false;
}

function lookupForFilter(datum, filterName) {
  return datum.filters.find((f) => f.name === filterName);
}

function reapplyFilters(datum, filters: any = null) {
  const _filters = filters || datum.filters;
  enableFilter(datum, null, null, _filters);
}

// id filter id
function enableFilter(datum, id, checked, filters = null) {
  datum.filters = datum.filters.slice(0);
  if (id) {
    datum.filters = datum.filters.map((filter) => {
      return { ...filter, flag: filter.id === id ? checked : filter.flag };
    });
  }

  resetDataToOrigin(datum);

  const _filters = filters || datum.filters;

  for (let filterIndex in _filters) {
    const filter = datum.filters[filterIndex];
    datum.filters[filterIndex] = {
      ...datum.filters[filterIndex],
      error: null,
    };

    if (filter.flag) {
      try {
        Filters[filter.name].apply(datum, filter.value);
      } catch (error: any) {
        datum.filters[filterIndex] = {
          ...datum.filters[filterIndex],
          error: error.message,
        };
      }
    }
  }
  updateData(datum);
}

function deleteFilter(datum, id?: string) {
  // delete the specified filter otherwise delete all filters where isDeleteAllow is true
  datum.filters = datum.filters
    .slice(0)
    .filter((filter) => (id ? filter.id !== id : !filter.isDeleteAllow));

  resetDataToOrigin(datum);

  for (let filterIndex in datum.filters) {
    const filter = datum.filters[filterIndex];
    datum.filters[filterIndex] = {
      ...datum.filters[filterIndex],
      error: null,
    };

    if (filter.flag) {
      try {
        Filters[filter.name].apply(datum, filter.value);
      } catch (error: any) {
        datum.filters[filterIndex] = {
          ...datum.filters[filterIndex],
          error: error.message,
        };
      }
    }
  }
  updateData(datum);
}

function addFilter(datum, filter, isDeleteAllow = true) {
  const id = v4();
  datum.filters = datum.filters.slice(0);
  delete filter.isSnapshot;
  datum.filters.push({
    ...filter,
    id,
    flag: true,
    isDeleteAllow,
  });
}

function replaceFilter(datum, filterID, value) {
  // datum.filters = datum.filters.slice(0);
  const index = datum.filters.findIndex((f) => f.id === filterID);
  delete datum.filters[index].isSnapshot;
  datum.filters[index] = {
    ...datum.filters[index],
    value,
  };
}

export { applyFilter, reapplyFilters, enableFilter, addFilter, deleteFilter };

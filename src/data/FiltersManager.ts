/* eslint-disable import/namespace */
import { v4 } from '@lukeed/uuid';

import * as Filters from './Filters';

export interface Filter {
  id: string;
  name: string;
  label: string;
  isDeleteAllow: boolean;
  flag: boolean;
  value: any;
}

/***
 * @param {object} Filters [{name:'',options:{}},{...}]
 */
function applyFilter(datum, filters: any[] = []) {
  let isReduced = false;
  for (let filter of filters) {
    const filterOption = {
      name: filter.name,
      label: Filters[filter.name].name,
      value: filter.options,
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
  if (isReduced) {
    if (filters.length === 1 && isLastFilter(datum, filters[0].name)) {
      Filters[filters[0].name].apply(datum, filters[0].options);
    } else {
      reapplyFilters(datum);
    }
  } else {
    for (let filter of filters) {
      Filters[filter.name].apply(datum, filter.options);
    }
  }
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
  datum.data = { ...datum.data, ...datum.originalData };
  datum.info = { ...datum.info, ...datum.originalInfo };
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
}
function deleteFilter(datum, id) {
  datum.filters = datum.filters.slice(0);
  datum.filters = datum.filters.filter((filter) => filter.id !== id);
  datum.data = { ...datum.data, ...datum.originalData };
  datum.info = { ...datum.info, ...datum.originalInfo };

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

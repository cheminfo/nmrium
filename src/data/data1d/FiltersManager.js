import generateID from '../utilities/generateID';

import { Filters } from './filter1d/Filters';

/***
 * @param {object} Filters [{name:'',options:{}},{...}]
 */
export class FiltersManager {
  static applyFilter(datum1d, filters = []) {
    let isReduced = false;
    for (let filter of filters) {
      const filterOption = {
        name: filter.name,
        label: Filters[filter.name].name,
        value: filter.options,
      };
      const previousFilter = FiltersManager.lookupForFilter(
        datum1d,
        filter.name,
      );
      if (previousFilter) {
        const reduceResult = Filters[filter.name].reduce(
          previousFilter.value,
          filterOption.value,
        );
        if (reduceResult.once) {
          if (!isReduced) {
            isReduced = true;
          }
          if (
            reduceResult.reduce != null &&
            reduceResult.reduce !== undefined
          ) {
            FiltersManager.replaceFilter(
              datum1d,
              previousFilter.id,
              reduceResult.reduce,
            );
          }
        } else {
          FiltersManager.addFilter(
            datum1d,
            filterOption,
            Object.prototype.hasOwnProperty.call(filter, 'isDeleteAllow')
              ? filter.isDeleteAllow
              : true,
          );
        }
      } else {
        FiltersManager.addFilter(
          datum1d,
          filterOption,
          Object.prototype.hasOwnProperty.call(filter, 'isDeleteAllow')
            ? filter.isDeleteAllow
            : true,
        );
      }
    }
    if (isReduced) {
      if (
        filters.length === 1 &&
        FiltersManager.isLastFilter(datum1d, filters[0].name)
      ) {
        Filters[filters[0].name].apply(datum1d, filters[0].options);
      } else {
        FiltersManager.reapplyFilters(datum1d);
      }
    } else {
      for (let filter of filters) {
        Filters[filter.name].apply(datum1d, filter.options);
      }
    }
  }

  static isLastFilter(datum1d, id) {
    const index = datum1d.filters.findIndex((f) => f.name === id);
    if (datum1d.filters.length === index + 1) {
      return true;
    }
    return false;
  }

  static lookupForFilter(datum1d, filterName) {
    return datum1d.filters.find((f) => f.name === filterName);
  }

  static reapplyFilters(datum1d, filters = null) {
    const _filters = filters ? filters : datum1d.filters;
    for (const filter of _filters) {
      const { id, flag } = filter;
      this.enableFilter(datum1d, id, flag, filters);
    }
  }

  // id filter id
  static enableFilter(datum1d, id, checked, filters = null) {
    datum1d.filters = datum1d.filters.slice(0);
    const index = datum1d.filters.findIndex((filter) => filter.id === id);
    datum1d.filters[index] = { ...datum1d.filters[index], flag: checked };

    datum1d.data = { ...datum1d.data, ...datum1d.source.original };
    datum1d.info = { ...datum1d.info, ...datum1d.originalInfo };
    const _filters = filters ? filters : datum1d.filters;
    for (let filterIndex in _filters) {
      const filter = datum1d.filters[filterIndex];
      datum1d.filters[filterIndex] = {
        ...datum1d.filters[filterIndex],
        error: null,
      };

      if (filter.flag) {
        try {
          Filters[filter.name].apply(datum1d, filter.value);
        } catch (error) {
          datum1d.filters[filterIndex] = {
            ...datum1d.filters[filterIndex],
            error: error.message,
          };
        }
      }
    }
  }
  static deleteFilter(datum1d, id) {
    datum1d.filters = datum1d.filters.slice(0);
    datum1d.filters = datum1d.filters.filter((filter) => filter.id !== id);
    datum1d.data = { ...datum1d.data, ...datum1d.source.original };
    datum1d.info = { ...datum1d.info, ...datum1d.originalInfo };

    for (let filterIndex in datum1d.filters) {
      const filter = datum1d.filters[filterIndex];
      datum1d.filters[filterIndex] = {
        ...datum1d.filters[filterIndex],
        error: null,
      };

      if (filter.flag) {
        try {
          Filters[filter.name].apply(datum1d, filter.value);
        } catch (error) {
          datum1d.filters[filterIndex] = {
            ...datum1d.filters[filterIndex],
            error: error.message,
          };
        }
      }
    }
  }

  static addFilter(datum1d, filter, isDeleteAllow = true) {
    const id = generateID();
    datum1d.filters = datum1d.filters.slice(0);
    delete filter.isSnapshot;
    datum1d.filters.push({
      ...filter,
      id: id,
      flag: true,
      isDeleteAllow,
    });
  }

  static replaceFilter(datum1d, filterID, value) {
    datum1d.filters = datum1d.filters.slice(0);
    const index = datum1d.filters.findIndex((f) => f.id === filterID);
    delete datum1d.filters[index].isSnapshot;
    datum1d.filters[index] = {
      ...datum1d.filters[index],
      value,
    };
  }
}

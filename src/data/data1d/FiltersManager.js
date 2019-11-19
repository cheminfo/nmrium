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
          FiltersManager.addFilter(datum1d, filterOption);
        }
      } else {
        FiltersManager.addFilter(datum1d, filterOption);
      }
    }
    if (isReduced) {
      FiltersManager.reapplyFilters(datum1d);
    } else {
      for (let filter of filters) {
        Filters[filter.name].apply(datum1d, filter.options);
      }
    }
  }

  static lookupForFilter(datum1d, filterName) {
    return datum1d.filters.find((f) => f.name === filterName);
  }

  static reapplyFilters(datum1d) {
    for (let filter of datum1d.filters) {
      const { id, flag } = filter;
      this.enableFilter(datum1d, id, flag);
    }
  }

  // id filter id
  static enableFilter(datum1d, id, checked) {
    datum1d.filters = datum1d.filters.slice(0);
    const index = datum1d.filters.findIndex((filter) => filter.id === id);
    datum1d.filters[index] = { ...datum1d.filters[index], flag: checked };
    const enabledFilters = datum1d.filters.filter(
      (filter) => filter.flag === true,
    );
    datum1d.data = { ...datum1d.data, ...datum1d.source.original };
    datum1d.info = { ...datum1d.info, ...datum1d.originalInfo };

    for (let filter of enabledFilters) {
      if (filter.flag) {
        Filters[filter.name].apply(datum1d, filter.value);
      }
    }
  }
  static deleteFilter(datum1d, id) {
    datum1d.filters = datum1d.filters.slice(0);
    datum1d.filters = datum1d.filters.filter((filter) => filter.id !== id);
    datum1d.data = { ...datum1d.data, ...datum1d.source.original };
    datum1d.info = { ...datum1d.info, ...datum1d.originalInfo };

    for (let filter of datum1d.filters) {
      if (filter.flag) {
        Filters[filter.name].apply(datum1d, filter.value);
      }
    }
  }

  static addFilter(datum1d, filter) {
    const id = Math.random()
      .toString(36)
      .replace('0.', '');
    datum1d.filters = datum1d.filters.slice(0);
    datum1d.filters.push({
      ...filter,
      id: id,
      flag: true,
    });
  }

  static replaceFilter(datum1d, filterID, value) {
    datum1d.filters = datum1d.filters.slice(0);
    const index = datum1d.filters.findIndex((f) => f.id === filterID);
    datum1d.filters[index] = {
      ...datum1d.filters[index],
      value,
    };
  }
}

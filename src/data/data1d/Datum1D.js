// import baseline from './baseline';
import max from 'ml-array-max';
import { parseWithoutProcessing } from 'handlebars';

import { Filters } from './filter1d/Filters';
import { reduce as reduceZeroFillingFilter } from './filter1d/zeroFilling';
import { reduce as reduceLineBroadeningFilter } from './filter1d/lineBroadening';
import autoPeakPicking from './autoPeakPicking';

export class Datum1D {
  /**
   *
   * @param {string} id
   * @param {object} options {display: {name, color, isVisible, isPeaksMarksVisible, ...}, meta: {isFid, nucleus}, ... }
   */
  constructor(options = {}) {
    this.id =
      options.id ||
      Math.random()
        .toString(36)
        .replace('0.', '');
    this.source = Object.assign(
      {
        jcamp: null,
        jcampURL: null,
        original: [],
      },
      options.source,
    );
    this.display = Object.assign(
      {
        name:
          options.display.name ||
          Math.random()
            .toString(36)
            .replace('0.', ''),
        color: 'black',
        isVisible: true,
        isPeaksMarkersVisible: true,
        isRealSpectrumVisible: true,
      },
      options.display,
    );
    // this.original = options.data; //{ x, re, im }
    this.info = Object.assign(
      {
        nucleus: '1H', // 1H, 13C, 19F, ...
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );

    this.originalInfo = Object.assign(
      {
        nucleus: '1H', // 1H, 13C, 19F, ...
        isFid: false,
        isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
      },
      options.info,
    );
    this.meta = Object.assign({}, options.meta);
    this.data = Object.assign(
      {
        x: [],
        re: [],
        im: [],
      },
      options.data,
    );
    this.peaks = Object.assign([], options.peaks); // array of object {index: xIndex, xShift}
    // in case the peak does not exactly correspond to the point value
    // we can think about a second attributed `xShift`
    this.integrals = Object.assign([], options.integrals); // array of object (from: xIndex, to: xIndex)
    this.filters = Object.assign([], options.filters);
    this.ranges = Object.assign([], options.ranges);

    this.preprocessing();

    //reapply filters after load the original data
    this.reapplyFilters();
  }

  preprocessing() {
    if (this.info.isFid) {
      // TODO need to check if we have the digital filter and change the data
    }
  }

  setIsRealSpectrumVisible(isVisible) {
    this.isRealSpectrumVisible = isVisible;
  }

  setPeaks(peaks) {
    this.peaks = peaks;
  }

  getPeaks() {
    return this.peaks;
  }

  getRanges() {
    return this.ranges;
  }

  setIntegrals(integrals) {
    this.integrals = Object.assign([], integrals);
  }

  getIntegrals() {
    return this.integrals;
  }

  baseline() {
    // let result = baseline(this.data.x, this.data.re, this.data.im);
  }

  applyAutoPeakPicking(options) {
    const peaks = autoPeakPicking(this, options);
    this.peaks = peaks;
    return this.peaks;
  }

  applyFilter(filterName, options) {
    const filterOption = {
      kind: filterName,
      value: options,
    };
    this.addFilter(filterOption);
    Filters[filterName](this, options);
  }

  applyManualPhaseCorrectionFilter(filterOptions) {
    Filters.phaseCorrection(this, filterOptions);
  }

  lookupForFilter(filterKind) {
    return this.filters.find((f) => f.kind === filterKind);
  }

  applyZeroFillingFilter(options) {
    let zeroFillingFilterOption = {
      kind: Filters.zeroFilling.name,
      value: options.zeroFillingSize,
    };
    const lineBroadeningFilterOption = {
      kind: Filters.lineBroadening.name,
      value: options.lineBroadeningValue,
    };
    const previousZeroFillingFilter = this.lookupForFilter(
      zeroFillingFilterOption.kind,
    );
    const previousLineBroadeningFilter = this.lookupForFilter(
      lineBroadeningFilterOption.kind,
    );

    if (previousZeroFillingFilter) {
      const reduceResult = reduceZeroFillingFilter(
        previousZeroFillingFilter.value,
        zeroFillingFilterOption.value,
      );
      if (reduceResult.once) {
        zeroFillingFilterOption.value = reduceResult.reduce;
        this.replaceFilter(
          previousZeroFillingFilter.id,
          zeroFillingFilterOption.value,
        );
      }
    } else {
      this.addFilter(zeroFillingFilterOption);
    }

    if (previousLineBroadeningFilter) {
      const reduceResult = reduceLineBroadeningFilter(
        previousLineBroadeningFilter.value,
        lineBroadeningFilterOption.value,
      );
      if (reduceResult.once) {
        lineBroadeningFilterOption.value = reduceResult.reduce;
        this.replaceFilter(
          previousLineBroadeningFilter.id,
          lineBroadeningFilterOption.value,
        );
      }
    } else {
      this.addFilter(lineBroadeningFilterOption);
    }

    // this.addFilter(lineBroadeningFilterOption);
    if (previousLineBroadeningFilter && previousZeroFillingFilter) {
      this.reapplyFilters();
    } else {
      this.applyFilter(Filters.zeroFilling.name, options.zeroFillingSize);
      this.applyFilter(Filters.fft.name, options.lineBroadeningValue);
    }
  }

  reapplyFilters() {
    for (let i = 0; i < this.filters.length; i++) {
      this.enableFilter(this.filters[i].id, this.filters[i].flag);
    }
  }

  // id filter id
  enableFilter(id, checked) {
    this.filters = [...this.filters];
    const index = this.filters.findIndex((filter) => filter.id === id);
    this.filters[index] = { ...this.filters[index], flag: checked };
    const enabledFilters = this.filters.filter(
      (filter) => filter.flag === true,
    );
    this.data = { ...this.data, ...this.source.original };
    this.info = { ...this.info, ...this.originalInfo };

    for (let filter of enabledFilters) {
      if (filter.flag) {
        Filters[filter.kind](this, filter.value);
      }
    }
  }
  deleteFilter(id) {
    this.filters = [...this.filters];
    this.filters = this.filters.filter((filter) => filter.id !== id);
    this.data = { ...this.data, ...this.source.original };
    this.info = { ...this.info, ...this.originalInfo };

    for (let filter of this.filters) {
      if (filter.flag) {
        Filters[filter.kind](this, filter.value);
      }
    }
  }

  getReal() {
    return { x: this.data.x, y: this.data.re };
  }

  getImaginary() {
    return { x: this.data.x, y: this.data.im };
  }

  // with mouse move
  lookupPeak(from, to) {
    let minIndex = this.data.x.findIndex((number) => number >= from);
    let maxIndex = this.data.x.findIndex((number) => number >= to) - 1;

    if (minIndex > maxIndex) {
      minIndex = maxIndex;
      maxIndex = minIndex;
    }
    const dataRange = this.data.re.slice(minIndex, maxIndex);
    if (dataRange && dataRange.length > 0) {
      const yValue = max(dataRange);
      const xIndex = dataRange.findIndex((value) => value === yValue);
      const xValue = this.data.x[minIndex + xIndex];

      return { x: xValue, y: yValue, xIndex: minIndex + xIndex };
    }
    return [];
  }
  /**
   *
   * @param {number} chemicalShift Target chemical shift
   * @param {number} window Range of chemical shifts to look for
   * @example  addPeak(5, 0.1)
   */
  // addPeak(from, to, options = {}) {
  //   // we look for the highest peak in the zone
  //   // return one peak
  //   // this.lookupPeak();
  //   // add peak in this.peaks
  // }

  addPeak(peak) {
    this.peaks = Object.assign([], this.peaks);
    this.peaks.push(peak);
  }

  // Add all the peaks in a range
  // click / drag / release
  addPeaks(from, to) {
    // we look for the highest peak in the zone for now
    // but it returns an array !
    // for now you return an array containing the result of addPeak
    if (from !== to) {
      this.peaks = Object.assign([], this.peaks);
      const peaks = this.lookupPeak(from, to);
      this.peaks = this.peaks.concat([peaks]);
    }
    return this.peaks;
  }

  addFilter(filter) {
    const id = Math.random()
      .toString(36)
      .replace('0.', '');
    this.filters = Object.assign([], this.filters);
    this.filters.push({
      ...filter,
      id: id,
      flag: true,
    });
  }

  replaceFilter(filterID, value) {
    this.filters = Object.assign([], this.filters);
    const index = this.filters.findIndex((f) => f.id === filterID);
    this.filters[index] = {
      ...this.filters[index],
      value,
    };
  }

  getFilters() {
    return this.filters;
  }

  toJSON() {
    return {
      data: this.data,
      id: this.id,
      source: {
        jcamp: this.source.jcamp,
        jcampURL: this.source.jcampURL,
        original: this.source.jcampURL ? [] : this.source.original,
      },
      display: this.display,
      info: this.originalInfo,
      meta: this.meta,
      peaks: this.peaks,
      integrals: this.integrals,
      ranges: this.ranges,
      filters: this.filters,
    };
  }
}

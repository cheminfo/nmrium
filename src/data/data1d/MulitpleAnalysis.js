import lodash from 'lodash';

import generateChar from '../utilities/generateChar';
// import generateID from '../utilities/generateID';

import { Datum1D } from './Datum1D';

export class MultipleAnalysis {
  spectraAanalysis = {};
  reservedColumnsNames = {};

  constructor(spectra = []) {
    this.spectra = spectra;
  }

  getColumnKey(nucleus) {
    if (this.reservedColumnsNames[nucleus] === undefined) {
      this.reservedColumnsNames[nucleus] = [];
    }
    const index = this.reservedColumnsNames[nucleus].length;
    const key = generateChar(index);
    this.reservedColumnsNames[nucleus].push(key);
    return key.toUpperCase();
  }

  getSpectraAnalysis(from, to) {
    return this.spectra.reduce(
      (acc, ob) => {
        if (ob instanceof Datum1D) {
          const range = ob.detectRange(from, to);
          acc.sum += range.absolute;
          acc.values.push({ SID: ob.getID(), ...range });
        }
        return acc;
      },
      { values: [], sum: 0 },
    );
  }

  analyzeSpectra(from, to, nucleus, columnKey = null) {
    if (this.spectraAanalysis[nucleus] === undefined) {
      this.spectraAanalysis[nucleus] = { options: { sum: 100 }, values: {} };
    }

    const sum = this.spectraAanalysis[nucleus].options.sum;

    const { values: result, sum: spectraSum } = this.getSpectraAnalysis(
      from,
      to,
    );

    const colKey = columnKey ? columnKey : this.getColumnKey(nucleus);

    const prevNucleusData = lodash.get(
      this.spectraAanalysis,
      `${nucleus}.values`,
      {},
    );

    const data = result.reduce((acc, row) => {
      const factor = spectraSum > 0 ? sum / spectraSum : 0.0;

      acc[row.SID] = {
        ...prevNucleusData[row.SID],
        [colKey]: {
          colKey,
          ...row,
          relative: Math.abs(row.absolute) * factor,
        },
      };
      return acc;
    }, {});

    this.spectraAanalysis[nucleus].values = data;
    // this.spectraAanalysis[nucleus].values = this.updateRelatives(
    //   data,
    //   totalSum,
    // );
    return lodash.cloneDeep(this.spectraAanalysis);
  }

  deleteSpectraAnalysis(colKey, nucleus) {
    const result = Object.entries(this.spectraAanalysis[nucleus].values).reduce(
      (acc, item) => {
        delete item[1][colKey];
        if (item[1] && Object.keys(item[1]).length > 0) {
          acc[item[0]] = item[1];
          return acc;
        }
        return acc;
      },
      {},
    );
    // const sum = this.spectraAanalysis[nucleus].options.sum;
    // this.spectraAanalysis[nucleus].values = this.updateRelatives(result, sum);
    this.spectraAanalysis[nucleus].values = result;

    if (lodash.isEmpty(this.spectraAanalysis[nucleus].values)) {
      this.reservedColumnsNames[nucleus] = [];
    }

    return lodash.cloneDeep(this.spectraAanalysis);
  }

  // updateRelatives(values, sum) {
  //   return Object.entries(values).reduce((spectraAcc, spectraItems) => {
  //     const currentSum = Object.values(spectraItems[1]).reduce(
  //       (acc, current) => {
  //         acc += Math.abs(current.absolute);
  //         return acc;
  //       },
  //       0,
  //     );
  //     const factor = currentSum > 0 ? sum / currentSum : 0.0;
  //     spectraAcc[spectraItems[0]] = Object.entries(spectraItems[1]).reduce(
  //       (rangeAcc, rangeItem) => {
  //         rangeAcc[rangeItem[0]] = {
  //           ...rangeItem[1],
  //           relative: Math.abs(rangeItem[1].absolute) * factor,
  //         };
  //         return rangeAcc;
  //       },
  //       {},
  //     );
  //     return spectraAcc;
  //   }, {});
  // }
}

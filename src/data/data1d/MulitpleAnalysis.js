import lodash from 'lodash';

import generateChar from '../utilities/generateChar';
// import generateID from '../utilities/generateID';

import { Datum1D } from './Datum1D';

export const COLUMNS_TYPES = {
  NORMAL: 'NORMAL',
  FORMULA: 'FORMULA',
};

export default class MultipleAnalysis {
  spectraAanalysis = {};
  reservedColumnsNames = {};

  constructor(spectra = []) {
    this.spectra = spectra;
  }

  addColumnKey(nucleus, columnProps, columnKey) {
    const index = Object.keys(this.spectraAanalysis[nucleus].options.columns)
      .length;
    const key = columnKey ? columnKey : generateChar(index).toUpperCase();
    this.spectraAanalysis[nucleus].options.columns[key] = columnProps;
    return key;
  }

  getColumns(nucleus) {
    return this.spectraAanalysis[nucleus].options.columns;
  }

  getValue(colKey, columns, data) {
    return data[columns[colKey].valueKey];
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

  init(nucleus) {
    if (this.spectraAanalysis[nucleus] === undefined) {
      this.spectraAanalysis[nucleus] = {
        options: {
          sum: 100,
          columns: {},
        },
        values: {},
      };
    }
  }

  changeColumnValueKey(nucleus, columnKey, newKey) {
    this.spectraAanalysis[nucleus].options.columns[columnKey].valueKey = newKey;

    this.spectraAanalysis[nucleus].values = this.refreshCalculation(nucleus);
    return lodash.cloneDeep(this.spectraAanalysis);
  }

  setColumn(nucleus, inputColumns) {
    this.init(nucleus);
    // const { columns } = this.spectraAanalysis[nucleus].options;
    this.spectraAanalysis[nucleus].options.columns = Object.values(
      inputColumns,
    ).reduce((acc, value) => {
      const data = { ...value };
      delete data.tempKey;
      acc[value.tempKey] = data;
      return acc;
    }, {});

    const { columns: newColumns } = this.spectraAanalysis[nucleus].options;

    let data = Object.entries(this.spectraAanalysis[nucleus].values).reduce(
      (outerAcc, [spectraKey, spectra]) => {
        outerAcc[spectraKey] = Object.keys(inputColumns).reduce((acc, key) => {
          const newKey = inputColumns[key].tempKey;
          if (spectra[key]) {
            acc[newKey] = spectra[key];
          }
          return acc;
        }, {});
        return outerAcc;
      },
      {},
    );

    data = Object.entries(data).reduce((acc, spectra) => {
      acc[spectra[0]] = Object.keys(newColumns).reduce((acc, key) => {
        const isFormula = newColumns[key].type === COLUMNS_TYPES.FORMULA;
        acc[key] = isFormula
          ? {
              colKey: key,
              value: this.calculate(
                newColumns,
                data[spectra[0]],
                newColumns[key].formula,
              ),
            }
          : { ...spectra[1][key], colKey: key };

        return acc;
      }, {});

      return acc;
    }, {});
    this.spectraAanalysis[nucleus].values = data;
    return lodash.cloneDeep(this.spectraAanalysis);
  }

  refreshByRow(row, columns) {
    return Object.keys(columns).reduce((acc, key) => {
      if (columns[key].type === COLUMNS_TYPES.FORMULA) {
        acc[key] = {
          colKey: key,
          ...row,
          value: this.calculate(columns, row, columns[key].formula),
        };
      }

      return acc;
    }, {});
  }

  refreshCalculation(nucleus) {
    const { columns } = this.spectraAanalysis[nucleus].options;

    const data = Object.entries(this.spectraAanalysis[nucleus].values).reduce(
      (acc, spectra) => {
        const [id, row] = spectra;
        acc[id] = {
          ...row,
          ...this.refreshByRow(row, columns),
        };
        return acc;
      },
      {},
    );

    return data;
  }

  analyzeSpectra(from, to, nucleus, columnKey = null) {
    this.init(nucleus);
    const colKey = this.addColumnKey(
      nucleus,
      {
        type: COLUMNS_TYPES.NORMAL,
        valueKey: 'relative',
        from,
        to,
        index: 1,
      },
      columnKey,
    );

    const { sum } = this.spectraAanalysis[nucleus].options;

    const { values: result, sum: spectraSum } = this.getSpectraAnalysis(
      from,
      to,
    );

    const prevNucleusData = lodash.get(
      this.spectraAanalysis,
      `${nucleus}.values`,
      {},
    );

    let data = result.reduce((acc, row) => {
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
    this.spectraAanalysis[nucleus].values = this.refreshCalculation(nucleus);

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

    delete this.spectraAanalysis[nucleus].options.columns[colKey];
    // const sum = this.spectraAanalysis[nucleus].options.sum;
    // this.spectraAanalysis[nucleus].values = this.updateRelatives(result, sum);
    this.spectraAanalysis[nucleus].values = result;
    this.spectraAanalysis[nucleus].values = this.refreshCalculation(nucleus);

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

  calculate(columns, data, formula = 'A+B') {
    const array = formula.split(/\+|-|\*|\/|%|\(|\)/);

    const variables = [];

    for (let i of array) {
      const l = i.trim();
      if (columns[l]) {
        variables.push(l);
      }
    }

    const params = variables.map((key) =>
      data[key] ? data[key][columns[key].valueKey] : null,
    );

    let result;
    try {
      // eslint-disable-next-line no-new-func
      result = new Function(...variables, `return ${formula}`)(...params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      result = 'Error';
    }
    return result;
  }
  getDataAsString(nucleus) {
    const {
      values,
      options: { columns },
    } = this.spectraAanalysis[nucleus];

    let result = '';

    for (const letter in columns) {
      result += `${letter}\t`;
    }
    result += '\n';

    for (const spectrum of Object.values(values)) {
      for (const letter in columns) {
        result += `${spectrum[letter][columns[letter].valueKey]}\t`;
      }
      result += '\n';
    }
    return result;
  }
}

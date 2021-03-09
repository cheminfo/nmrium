import lodashGet from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import generateChar from '../utilities/generateChar';

import { detectRange } from './Datum1D';

export const COLUMNS_TYPES = {
  NORMAL: 'NORMAL',
  FORMULA: 'FORMULA',
};

let reservedColumnsNames = {};

function addColumnKey(spectraAnalysis, nucleus, columnProps, columnKey) {
  const index = Object.keys(spectraAnalysis[nucleus].options.columns).length;
  const key = columnKey ? columnKey : generateChar(index).toUpperCase();
  spectraAnalysis[nucleus].options.columns[key] = columnProps;
  return key;
}

export function getColumns(spectraAnalysis, nucleus) {
  return spectraAnalysis[nucleus].options.columns;
}

export function getValue(colKey, columns, data) {
  return data[columns[colKey].valueKey];
}

export function getSpectraAnalysis(spectra, options) {
  const { from, to, nucleus } = options;
  return spectra.reduce(
    (acc, datum) => {
      if (
        datum.info.dimension === 1 &&
        datum.info.nucleus === nucleus &&
        !datum.info.isFid
      ) {
        const range = detectRange(datum, { from, to });
        acc.sum += range.absolute;
        acc.values.push({ SID: datum.id, ...range });
      }
      return acc;
    },
    { values: [], sum: 0 },
  );
}

function init(spectraAnalysis, nucleus) {
  if (spectraAnalysis[nucleus] === undefined) {
    spectraAnalysis[nucleus] = {
      options: {
        sum: 100,
        code: null,
        columns: {},
      },
      values: {},
    };
  }
}

export function changeColumnValueKey(
  spectraAnalysis,
  nucleus,
  columnKey,
  newKey,
) {
  spectraAnalysis[nucleus].options.columns[columnKey].valueKey = newKey;

  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );
}

export function setColumn(
  spectraAnalysis,
  nucleus,
  { columns: inputColumns, code },
) {
  init(spectraAnalysis, nucleus);
  spectraAnalysis[nucleus].options.code = code;
  spectraAnalysis[nucleus].options.columns = Object.values(inputColumns).reduce(
    (acc, value) => {
      const data = { ...value };
      delete data.tempKey;
      acc[value.tempKey] = data;
      return acc;
    },
    {},
  );

  const { columns: newColumns } = spectraAnalysis[nucleus].options;

  let data = Object.entries(spectraAnalysis[nucleus].values).reduce(
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
            value: calculate(
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
  spectraAnalysis[nucleus].values = data;
}

function refreshByRow(row, columns) {
  return Object.keys(columns).reduce((acc, key) => {
    if (columns[key].type === COLUMNS_TYPES.FORMULA) {
      acc[key] = {
        colKey: key,
        ...row,
        value: calculate(columns, row, columns[key].formula),
      };
    }

    return acc;
  }, {});
}

function refreshCalculation(spectraAnalysis, nucleus) {
  const { columns } = spectraAnalysis[nucleus].options;

  const data = Object.entries(spectraAnalysis[nucleus].values).reduce(
    (acc, spectra) => {
      const [id, row] = spectra;
      acc[id] = {
        ...row,
        ...refreshByRow(row, columns),
      };
      return acc;
    },
    {},
  );

  return data;
}

export function analyzeSpectra(spectra, spectraAnalysis, options) {
  const { from, to, nucleus, columnKey = null } = options;
  init(spectraAnalysis, nucleus);
  const colKey = addColumnKey(
    spectraAnalysis,
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

  const { sum } = spectraAnalysis[nucleus].options;

  const { values: result, sum: spectraSum } = getSpectraAnalysis(spectra, {
    from,
    to,
    nucleus,
  });

  const prevNucleusData = lodashGet(spectraAnalysis, `${nucleus}.values`, {});

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

  spectraAnalysis[nucleus].values = data;
  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );
}

export function deleteSpectraAnalysis(spectraAnalysis, colKey, nucleus) {
  const result = Object.entries(spectraAnalysis[nucleus].values).reduce(
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

  delete spectraAnalysis[nucleus].options.columns[colKey];
  spectraAnalysis[nucleus].values = result;
  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );

  if (isEmpty(spectraAnalysis[nucleus].values)) {
    reservedColumnsNames[nucleus] = [];
  }
}

function calculate(columns, data, formula = 'A+B') {
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
    result = new Error(`Invalid Formula ( ${formula} ) `);
  }
  return result;
}
export function getDataAsString(spectraAnalysis, nucleus) {
  if (spectraAnalysis && spectraAnalysis[nucleus]) {
    const {
      values,
      options: { columns },
    } = spectraAnalysis[nucleus];

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
  return null;
}

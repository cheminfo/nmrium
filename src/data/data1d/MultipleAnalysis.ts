import lodashGet from 'lodash/get';

import { Spectra } from '../../component/NMRium';
import { RangeDetectionResult } from '../types/data1d';
import generateChar from '../utilities/generateChar';

import { detectRange, isSpectrum1D } from './Spectrum1D';

export enum COLUMNS_TYPES {
  NORMAL = 'NORMAL',
  FORMULA = 'FORMULA',
}
export enum COLUMNS_VALUES_KEYS {
  RELATIVE = 'relative',
  ABSOLUTE = 'absolute',
  MIN = 'min',
  MAX = 'max',
}

export type ColumnType = keyof typeof COLUMNS_TYPES;

interface Column {
  type: ColumnType;
  valueKey: COLUMNS_VALUES_KEYS;
  from: number;
  to: number;
  formula?: string;
  index: number;
}

type Columns = Record<string, Column>;

interface AnalysisOptions {
  sum: number;
  code: string | null;
  columns: Columns;
  columnIndex: number;
}

interface AnalysisRow extends RangeDetectionResult {
  SID: string;
  colKey?: string;
  value?: number;
}

interface SpectraAnalysisData {
  options: AnalysisOptions;
  values: Record<string, AnalysisRow>;
}

export type SpectraAnalysis = Record<string, SpectraAnalysisData>;

function addColumnKey(
  spectraAnalysis: SpectraAnalysis,
  nucleus: string,
  columnProps: Column,
  columnKey: string,
) {
  const key = columnKey
    ? columnKey
    : generateChar(spectraAnalysis[nucleus].options.columnIndex).toUpperCase();
  spectraAnalysis[nucleus].options.columns[key] = columnProps;
  spectraAnalysis[nucleus].options.columnIndex++;
  return key;
}

export function getColumns(spectraAnalysis: SpectraAnalysis, nucleus: string) {
  return spectraAnalysis[nucleus].options.columns;
}

export function getValue(colKey: string, columns: Columns, data) {
  return data[columns[colKey].valueKey];
}

export function getSpectraAnalysis(
  spectra: Spectra,
  options,
): { values: Array<AnalysisRow>; sum: number } {
  const { from, to, nucleus } = options;
  const result: { values: Array<AnalysisRow>; sum: number } = {
    values: [],
    sum: 0,
  };
  for (const datum of spectra) {
    if (
      isSpectrum1D(datum) &&
      datum.info.nucleus === nucleus &&
      !datum.info.isFid
    ) {
      const range = detectRange(datum, { from, to });
      result.sum += range.absolute;
      result.values.push({ SID: datum.id, ...range });
    }
  }
  return result;
}

function init(spectraAnalysis: SpectraAnalysis, nucleus: string) {
  if (spectraAnalysis[nucleus] === undefined) {
    spectraAnalysis[nucleus] = {
      options: {
        sum: 100,
        code: null,
        columns: {},
        columnIndex: 0,
      },
      values: {},
    };
  }
}

export function changeColumnValueKey(
  spectraAnalysis: SpectraAnalysis,
  nucleus: string,
  columnKey: string,
  newKey: COLUMNS_VALUES_KEYS,
) {
  spectraAnalysis[nucleus].options.columns[columnKey].valueKey = newKey;

  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );
}

export function setColumn(
  spectraAnalysis: SpectraAnalysis,
  nucleus: string,
  { columns: inputColumns, code },
) {
  init(spectraAnalysis, nucleus);
  spectraAnalysis[nucleus].options.code = code;
  const columns = Object.fromEntries(
    Object.values(inputColumns).map((value: any) => {
      const data = { ...value };
      delete data.tempKey;
      return [value.tempKey, data];
    }),
  );
  spectraAnalysis[nucleus].options.columns = columns;

  const { columns: newColumns } = spectraAnalysis[nucleus].options;

  let data = Object.fromEntries(
    Object.entries(spectraAnalysis[nucleus].values).map(
      ([spectraKey, spectra]) => {
        const result = Object.fromEntries(
          Object.keys(inputColumns)
            .filter((k) => spectra[k])
            .map((key) => {
              const newKey = inputColumns[key].tempKey;
              return [newKey, spectra[key]];
            }),
        );
        return [spectraKey, result];
      },
    ),
  );
  const newData = Object.fromEntries(
    Object.entries(data).map((spectra: any) => {
      const result = Object.fromEntries(
        Object.keys(newColumns).map((key) => {
          const isFormula = newColumns[key].type === COLUMNS_TYPES.FORMULA;
          return [
            key,
            isFormula
              ? {
                  colKey: key,
                  value: calculate(
                    newColumns,
                    data[spectra[0]],
                    newColumns[key].formula,
                  ),
                }
              : { ...spectra[1][key], colKey: key },
          ];
        }),
      );
      return [spectra[0], result];
    }),
  );
  data = newData;
  spectraAnalysis[nucleus].values = data;
}

function refreshByRow(row, columns) {
  return Object.fromEntries(
    Object.keys(columns)
      .filter((k) => columns[k].type === COLUMNS_TYPES.FORMULA)
      .map((key) => [
        key,
        {
          colKey: key,
          ...row,
          value: calculate(columns, row, columns[key].formula),
        },
      ]),
  );
}

function refreshCalculation(spectraAnalysis: SpectraAnalysis, nucleus: string) {
  const { columns } = spectraAnalysis[nucleus].options;

  return Object.fromEntries(
    Object.entries(spectraAnalysis[nucleus].values).map(([id, row]) => [
      id,
      {
        ...row,
        ...refreshByRow(row, columns),
      },
    ]),
  );
}

export function analyzeSpectra(
  spectra,
  spectraAnalysis: SpectraAnalysis,
  options,
) {
  const { from, to, nucleus, columnKey = null } = options;
  init(spectraAnalysis, nucleus);
  const colKey = addColumnKey(
    spectraAnalysis,
    nucleus,
    {
      type: COLUMNS_TYPES.NORMAL,
      valueKey: COLUMNS_VALUES_KEYS.RELATIVE,
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

  const data = Object.fromEntries(
    result.map((row) => {
      const factor = spectraSum > 0 ? sum / spectraSum : 0.0;

      return [
        row.SID,
        {
          ...prevNucleusData[row.SID],
          [colKey]: {
            colKey,
            ...row,
            relative: Math.abs(row.absolute) * factor,
          },
        },
      ];
    }),
  );

  spectraAnalysis[nucleus].values = data;
  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );
}

export function deleteSpectraAnalysis(
  spectraAnalysis: SpectraAnalysis,
  colKey: string,
  nucleus: string,
) {
  const result = {};
  Object.entries(spectraAnalysis[nucleus].values).forEach((item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete item[1][colKey];
    if (item[1] && Object.keys(item[1]).length > 0) {
      result[item[0]] = item[1];
    }
  });

  const { [colKey]: deletedColumnKey, ...resColumns } =
    spectraAnalysis[nucleus].options.columns;

  const currentColumns = Object.keys(spectraAnalysis[nucleus].options.columns);

  if (currentColumns.length === 1) {
    spectraAnalysis[nucleus].options.columnIndex = 0;
  }

  spectraAnalysis[nucleus].options.columns = resColumns;
  spectraAnalysis[nucleus].values = result;
  spectraAnalysis[nucleus].values = refreshCalculation(
    spectraAnalysis,
    nucleus,
  );
}

function calculate(columns: Columns, data: AnalysisRow, formula = '') {
  const array = formula.split(/\+|-|\*|\/|%|\(|\)/);

  const variables: string[] = [];

  for (const col of array) {
    const column = col.trim();
    if (columns[column]) {
      variables.push(column);
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
    console.error(e);
    result = new Error(`Invalid Formula ( ${formula} ) `);
  }
  return result;
}

export function getDataAsString(
  spectraAnalysis: SpectraAnalysis,
  nucleus: string,
) {
  if (spectraAnalysis?.[nucleus]) {
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

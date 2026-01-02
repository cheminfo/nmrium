import type {
  AnalysisColumnsValuesKeys,
  AnalysisOptions,
  JpathTableColumn,
  MultipleSpectraAnalysisPreferences,
  PanelsPreferences,
  SpectraAnalysisColumn,
  SpectraAnalysisColumns,
  Spectrum1D,
  Spectrum,
  WorkSpacePanelPreferences,
} from '@zakodium/nmrium-core';
import {
  ANALYSIS_COLUMN_TYPES,
  ANALYSIS_COLUMN_VALUES_KEYS,
} from '@zakodium/nmrium-core';
import dlv from 'dlv';

import type { RangeDetectionResult } from '../types/data1d/index.js';
import { convertSpectraArrayToObject } from '../utilities/convertSpectraListToObject.js';
import generateChar from '../utilities/generateChar.js';

import { detectRange, isSpectrum1D } from './Spectrum1D/index.js';

interface AnalysisRow extends RangeDetectionResult {
  SID: string;
  colKey?: string;
  value?: number;
}

export interface SpectraAnalysisData {
  options: AnalysisOptions;
  values: Array<Record<string, AnalyzeSpectraCalculateResult>>;
}

export function cutAnalysis(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  nucleus: string,
  x: number,
) {
  const cutColumns: Record<string, SpectraAnalysisColumn> = {};

  const analysisOptions = spectraAnalysis[nucleus].analysisOptions;
  for (const [columnKey, column] of Object.entries(analysisOptions.columns)) {
    const { to, from } = column;
    if (x > from && x < to) {
      cutColumns[columnKey] = { ...column, from: x, to };
      const newKey = generateChar(analysisOptions.columnIndex).toUpperCase();
      cutColumns[newKey] = { ...column, from, to: x };
      analysisOptions.columnIndex++;
    }
  }
  analysisOptions.columns = { ...analysisOptions.columns, ...cutColumns };
}

function addColumnKey(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  nucleus: string,
  columnProps: SpectraAnalysisColumn,
  columnKey: string,
) {
  const spectraAnalysisOptions = spectraAnalysis[nucleus].analysisOptions;
  const key =
    columnKey || generateChar(spectraAnalysisOptions.columnIndex).toUpperCase();
  spectraAnalysisOptions.columns[key] = columnProps;
  spectraAnalysisOptions.columnIndex++;
  return key;
}

function getSpectraAnalysis(
  spectra: Spectrum[],
  options: any,
): { values: AnalysisRow[]; sum: number } {
  const { from, to, nucleus } = options;
  const result: { values: AnalysisRow[]; sum: number } = {
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

function init(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  nucleus: string,
) {
  if (!spectraAnalysis?.[nucleus]) {
    spectraAnalysis[nucleus] = {
      ...spectraAnalysis[nucleus],
      analysisOptions: {
        resortSpectra: true,
        sum: 100,
        code: null,
        columns: {},
        columnIndex: 0,
      },
    };
  }
}

export function mapColumns(
  options: MultipleSpectraAnalysisPreferences['analysisOptions'],
) {
  const { code, columns: inputColumns, ...restSetting } = options;
  const columns = Object.fromEntries(
    Object.values(inputColumns).map((value: any) => {
      const data = { ...value };
      delete data.tempKey;
      return [value.tempKey, data];
    }),
  );
  return {
    code,
    columns,
    ...restSetting,
  };
}

export function changeColumnValueKey(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  nucleus: string,
  columnKey: string,
  newKey: AnalysisColumnsValuesKeys,
) {
  spectraAnalysis[nucleus].analysisOptions.columns[columnKey].valueKey = newKey;
}

export function analyzeSpectra(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  options: any,
) {
  const { from, to, nucleus, columnKey = null } = options;
  init(spectraAnalysis, nucleus);
  addColumnKey(
    spectraAnalysis,
    nucleus,
    {
      type: ANALYSIS_COLUMN_TYPES.NORMAL,
      valueKey: ANALYSIS_COLUMN_VALUES_KEYS.ABSOLUTE,
      from,
      to,
      index: 1,
    },
    columnKey,
  );
}

interface ColumnData {
  colKey: string;
  analysisRow: AnalysisRow;
  relative: number;
}

type ColumnsData = Record<string, ColumnData>;

interface AnalyzeSpectraCalculateResult {
  SID: string;
  id: string;
  colKey: string;
  value: number;
}

export function generateAnalyzeSpectra(
  multipleSpectraAnalysis: MultipleSpectraAnalysisPreferences,
  spectra: Spectrum1D[],
  nucleus: string,
): SpectraAnalysisData {
  const data: Record<string, ColumnsData> = {};
  const { sum, columns } = multipleSpectraAnalysis.analysisOptions;

  for (const columnKey in columns) {
    const { from, to } = columns[columnKey];

    const { values: result, sum: spectraSum } = getSpectraAnalysis(spectra, {
      from,
      to,
      nucleus,
    });

    for (const spectrum of result) {
      const factor = spectraSum > 0 ? sum / spectraSum : 0;
      const item: ColumnData = {
        colKey: columnKey,
        analysisRow: spectrum,
        relative: Math.abs(spectrum.absolute) * factor,
      };
      if (!data[spectrum.SID]) {
        data[spectrum.SID] = {
          [columnKey]: item,
        };
      } else {
        data[spectrum.SID][columnKey] = item;
      }
    }
  }

  const newData: Record<
    string,
    Record<string, AnalyzeSpectraCalculateResult>
  > = Object.fromEntries(
    Object.entries(data).map(([entryKey, entryValue]) => {
      const result = Object.fromEntries(
        Object.keys(columns).map((key) => {
          const isFormula = columns[key].type === ANALYSIS_COLUMN_TYPES.FORMULA;
          const valueKey = columns[key].valueKey;
          const { SID, id } = entryValue[key].analysisRow;
          if (isFormula) {
            return [
              key,
              {
                SID,
                id,
                colKey: key,
                value: calculate(key, columns, data[entryKey]),
              },
            ] as const;
          }

          const value = (entryValue[key].analysisRow as any)[valueKey];
          return [key, { id, SID, colKey: key, value }] as const;
        }),
      );
      return [entryKey, result];
    }),
  );

  return {
    values: Object.values(newData),
    // The function is not changing the options, so there is no reason to return them with it.
    options: multipleSpectraAnalysis.analysisOptions,
  };
}

export function deleteSpectraAnalysis(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  colKey: string,
  nucleus: string,
) {
  if (spectraAnalysis?.[nucleus]) {
    const analysisOptions = spectraAnalysis[nucleus].analysisOptions;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete analysisOptions.columns[colKey];

    if (Object.keys(analysisOptions.columns).length === 1) {
      analysisOptions.columnIndex = 0;
    }
  }
}

function calculate(
  columnKey: string,
  columns: SpectraAnalysisColumns,
  data: ColumnsData,
  visited = new Set<string>(),
): number {
  if (visited.has(columnKey)) {
    return 0;
  }
  visited.add(columnKey);

  const { formula } = columns[columnKey];
  const variables: string[] = Object.keys(columns);

  const params = variables.map((key) => {
    const column = columns[key];
    if (!column || !data[key]) return null;

    const { valueKey, type } = column;

    if (type === 'FORMULA') {
      return calculate(key, columns, data, new Set(visited));
    }

    return (data[key].analysisRow as any)[valueKey];
  });

  let result;
  try {
    // eslint-disable-next-line no-new-func
    result = new Function('Math', ...variables, `return ${formula}`)(
      Math,
      ...params,
    );
  } catch {
    result = new Error(`Invalid Formula ( ${formula} )`);
  }

  return result;
}

export function getDataAsString(
  spectraAnalysis: SpectraAnalysisData,
  spectra: Spectrum1D[],
  spectraPanelPreferences: WorkSpacePanelPreferences['spectra'],
) {
  const spectraData = convertSpectraArrayToObject(spectra);
  if (spectraAnalysis) {
    const {
      values,
      options: { columns },
    } = spectraAnalysis;

    //columns labels
    const letters = Object.keys(columns);

    const columnsLabels: string[] = letters.slice();
    let index = 0;
    // listed the spectra panel columns
    for (const col of spectraPanelPreferences.columns) {
      if (col.visible && 'jpath' in col) {
        columnsLabels.splice(index, 0, col.label);
        index++;
      }
    }

    let result = `${columnsLabels.join('\t')}\n`;

    for (const spectrumAnalysis of values) {
      const spectrum = spectraData[spectrumAnalysis[letters[0]].SID];
      const cellsValues: string[] = [];

      // listed the spectra cell values
      for (const col of spectraPanelPreferences.columns) {
        if (col.visible && 'jpath' in col) {
          const jpath = (col as JpathTableColumn)?.jpath;
          const value = dlv(spectrum, jpath, `null`);
          cellsValues.push(value);
        }
      }

      // listed the spectra analysis cell values
      for (const letter of letters) {
        const value = spectrumAnalysis[letter].value;
        cellsValues.push(String(value));
      }
      result += `${cellsValues.join('\t')}\n`;
    }
    return result;
  }
  return null;
}

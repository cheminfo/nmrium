import lodashGet from 'lodash/get';
import {
  Spectrum,
  Spectrum1D,
  JpathTableColumn,
  MultipleSpectraAnalysisPreferences,
  PanelsPreferences,
  PredefinedSpectraColumn,
  PredefinedTableColumn,
  WorkSpacePanelPreferences,
  AnalysisOptions,
  AnalysisColumnsTypes,
  SpectraAnalysisColumns,
  SpectraAnalysisColumn,
  AnalisisColumnsValuesKeys,
} from 'nmr-load-save';

import { RangeDetectionResult } from '../types/data1d/index';
import { convertSpectraArrayToObject } from '../utilities/convertSpectraListToObject';
import generateChar from '../utilities/generateChar';

import { detectRange, isSpectrum1D } from './Spectrum1D/index';

export type ColumnType = keyof typeof AnalysisColumnsTypes;

export interface AnalysisRow extends RangeDetectionResult {
  SID: string;
  colKey?: string;
  value?: number;
}

export interface SpectraAnalysisInnerData {
  options: AnalysisOptions;
  values: Record<string /** spectrum key */, AnalysisRow>;
}
export interface SpectraAnalysisData {
  options: AnalysisOptions;
  values: AnalysisRow[];
}

export type SpectraAnalysis = Record<
  string /** where the key is the nucleus*/,
  SpectraAnalysisInnerData
>;

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

export function getColumns(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  nucleus: string,
) {
  return spectraAnalysis[nucleus].analysisOptions.columns;
}

export function getValue(
  colKey: string,
  columns: SpectraAnalysisColumns,
  data,
) {
  return data[columns[colKey].valueKey];
}

export function getSpectraAnalysis(
  spectra: Spectrum[],
  options,
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
  newKey: AnalisisColumnsValuesKeys,
) {
  spectraAnalysis[nucleus].analysisOptions.columns[columnKey].valueKey = newKey;
}

export function analyzeSpectra(
  spectraAnalysis: PanelsPreferences['multipleSpectraAnalysis'],
  options,
) {
  const { from, to, nucleus, columnKey = null } = options;
  init(spectraAnalysis, nucleus);
  addColumnKey(
    spectraAnalysis,
    nucleus,
    {
      type: AnalysisColumnsTypes.NORMAL,
      valueKey: AnalisisColumnsValuesKeys.ABSOLUTE,
      from,
      to,
      index: 1,
    },
    columnKey,
  );
}

export function generateAnalyzeSpectra(
  multipleSpectraAnalysis: MultipleSpectraAnalysisPreferences,
  spectra: Spectrum1D[],
  nucleus: string,
) {
  const data: any = {};
  const { sum, columns, code } = multipleSpectraAnalysis.analysisOptions;

  for (const columnKey in columns) {
    const { from, to } = columns[columnKey];

    const { values: result, sum: spectraSum } = getSpectraAnalysis(spectra, {
      from,
      to,
      nucleus,
    });

    for (const spectrum of result) {
      const factor = spectraSum > 0 ? sum / spectraSum : 0;

      data[spectrum.SID] = {
        ...data[spectrum.SID],
        [columnKey]: {
          colKey: columnKey,
          ...spectrum,
          relative: Math.abs(spectrum.absolute) * factor,
        },
      };
    }
  }

  const newData = Object.fromEntries(
    Object.entries(data).map((spectra: any) => {
      const result = Object.fromEntries(
        Object.keys(columns).map((key) => {
          const isFormula = columns[key].type === AnalysisColumnsTypes.FORMULA;
          return [
            key,
            isFormula
              ? {
                  colKey: key,
                  value: calculate(
                    columns,
                    data[spectra[0]],
                    columns[key].formula,
                  ),
                }
              : { ...spectra[1][key], colKey: key },
          ];
        }),
      );
      return [spectra[0], result];
    }),
  );

  return { values: Object.values(newData), options: { columns, code } };
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
  columns: SpectraAnalysisColumns,
  data: AnalysisRow,
  formula = '',
) {
  const array = formula.split(/[%()*+/-]/);

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
  } catch {
    result = new Error(`Invalid Formula ( ${formula} ) `);
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

    let result = '';
    // listed the spectra panel columns
    for (const col of spectraPanelPreferences.columns) {
      if (col.visible) {
        const { name } = col as PredefinedTableColumn<PredefinedSpectraColumn>;
        if ((name && ['name', 'solvent'].includes(name)) || !name) {
          result += `${col.label}\t`;
        }
      }
    }

    const letters = Object.keys(columns);

    // listed the spectra analysis panel columns
    for (const letter of letters) {
      result += `${letter}\t`;
    }
    result += '\n';

    for (const spectrumAnalysis of Object.values(values)) {
      const spectrum = spectraData[spectrumAnalysis[letters[0]].SID];

      // listed the spectra cell values
      for (const col of spectraPanelPreferences.columns) {
        if (col.visible) {
          const name = (col as PredefinedTableColumn<PredefinedSpectraColumn>)
            ?.name;
          if (name) {
            switch (name) {
              case 'name':
                result += `${spectrum.info.name}\t`;
                break;
              case 'solvent':
                result += `${spectrum.info.solvent || `null`}\t`;
                break;
              default:
                break;
            }
          } else {
            const path = (col as JpathTableColumn)?.jpath;
            result += `${lodashGet(spectrum, path, `null`)}\t`;
          }
        }
      }

      // listed the spectra analysis cell values
      for (const letter of letters) {
        result += `${spectrumAnalysis[letter][columns[letter].valueKey]}\t`;
      }
      result += '\n';
    }
    return result;
  }
  return null;
}

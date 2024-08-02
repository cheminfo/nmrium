import { saveAs } from 'file-saver';
import {
  Spectrum,
  Workspace,
  processJcamp,
  serializeNmriumState,
  CURRENT_EXPORT_VERSION,
  spectrum1DToJcamp,
} from 'nmr-load-save';

import { State } from '../component/reducer/Reducer';

import { isSpectrum1D, initiateDatum1D } from './data1d/Spectrum1D';
import { initiateDatum2D } from './data2d/Spectrum2D';
import * as Molecule from './molecules/Molecule';

export enum DataExportOptions {
  ROW_DATA = 'ROW_DATA',
  DATA_SOURCE = 'DATA_SOURCE',
  NO_DATA = 'NO_DATA',
}

export type DataExportOptionsType = keyof typeof DataExportOptions;

type ExportTarget = 'nmrium' | 'onChange';

export interface ExportOptions {
  dataType?: DataExportOptionsType;
  view?: boolean;
  settings?: boolean;
  serialize?: boolean;
  exportTarget?: ExportTarget;
}

function getData(datum, usedColors) {
  const dimension = datum.info.dimension;
  if (dimension === 1) {
    return initiateDatum1D(datum, { usedColors });
  } else if (dimension === 2) {
    return initiateDatum2D(datum, { usedColors });
  }
}

export function addJcamp(output, jcamp, options, usedColors) {
  options = options || {};
  const name = options?.info?.name;
  const { spectra: spectraIn } = processJcamp(jcamp, {
    name,
    converter: {
      keepRecordsRegExp: /.*/,
      profiling: true,
    },
  });
  if (spectraIn.length === 0) return;

  const spectra: Spectrum[] = [];
  for (const spectrum of spectraIn) {
    const data = getData(spectrum, usedColors);
    if (!data) continue;
    spectra.push(data);
  }
  output.push(...spectra);
}

/**
 *
 * @param {object} state
 */

export function toJSON(
  state: Partial<State>,
  preferencesState: Partial<{
    current: Workspace;
  }>,
  options: ExportOptions = {},
) {
  const {
    source,
    data = [],
    molecules: mols = [],
    correlations = {},
    actionType = '',
  } = state;

  const {
    dataType = 'ROW_DATA',
    view = false,
    settings = false,
    serialize = true,
    exportTarget = 'nmrium',
  } = options;

  const molecules = mols.map((mol: Molecule.StateMoleculeExtended) =>
    Molecule.toJSON(mol),
  );

  const nmriumState: any = {
    version: CURRENT_EXPORT_VERSION,
    data: {
      ...(exportTarget === 'onChange' ? { actionType } : {}),
      source,
      spectra: data,
      molecules,
      correlations,
    },
    view: state.view,
    settings: preferencesState.current,
  };

  if (!serialize) {
    return nmriumState;
  } else {
    const includeData =
      dataType === 'ROW_DATA'
        ? 'rawData'
        : dataType === 'NO_DATA'
          ? 'noData'
          : 'dataSource';

    return serializeNmriumState(nmriumState, {
      includeData,
      includeSettings: settings,
      includeView: view,
    });
  }
}

export type DataExportStage =
  | 'originalFid'
  | 'originalFtReal'
  | 'originalFtRealImaginary'
  | 'processedReal'
  | 'processedRealImaginary';

export function exportAsJcamp(
  spectrum: Spectrum,
  dataExportStage: DataExportStage,
) {
  let jcamp: string | null = null;
  if (!isSpectrum1D(spectrum)) {
    throw new Error('convert 2D spectrum to JCAMP is not supported');
  }
  const { originalData, originalInfo, ...otherSpectrum } = spectrum;

  const exportedSpectrum: Spectrum = { ...otherSpectrum };

  if (!['processedReal', 'processedRealImaginary'].includes(dataExportStage)) {
    if (!originalData || !originalInfo) {
      throw new Error('original data should exists');
    }

    exportedSpectrum.filters = [];
    exportedSpectrum.data = originalData;
    exportedSpectrum.info = originalInfo;
  }

  const onlyReal =
    dataExportStage === 'processedReal' || dataExportStage === 'originalFtReal';

  jcamp = spectrum1DToJcamp(exportedSpectrum, {
    onlyReal,
  });

  if (!jcamp) {
    throw new Error('convert spectrum to JCAMP failed');
  }

  const blob = new Blob([jcamp], { type: 'text/plain' });
  saveAs(blob, `${spectrum.info.name}.jdx`);
}

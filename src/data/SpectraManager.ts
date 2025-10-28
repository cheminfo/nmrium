import type {
  IncludeData,
  NMRiumCore,
  NmriumState,
  SerializedNmriumState,
  Spectrum,
  StateMolecule,
  Workspace,
} from '@zakodium/nmrium-core';
import { CURRENT_EXPORT_VERSION } from '@zakodium/nmrium-core';
import {
  processJCAMPDX,
  spectrum1DToJCAMPDX,
} from '@zakodium/nmrium-core-plugins';
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import * as OCL from 'openchemlib';
import { assert } from 'react-science/ui';

import type { State } from '../component/reducer/Reducer.js';
import { saveAs } from '../component/utility/save_as.ts';

import { initiateDatum1D, isSpectrum1D } from './data1d/Spectrum1D/index.js';
import { initiateDatum2D } from './data2d/Spectrum2D/index.js';
import * as Molecule from './molecules/Molecule.js';

export const DataExportOptions = {
  /**
   * Export the data as it is in the state, including all the raw data arrays.
   */
  RAW_DATA: 'RAW_DATA',

  /**
   * Export the data as it is in the state, excluding all the raw data arrays.
   * They are replaced by empty arrays.
   * When the nmrium file will be imported, the data will be fetched from the original source.
   *
   * @see State.sources
   */
  DATA_SOURCE: 'DATA_SOURCE',

  /**
   * Export only metadata, without any data.
   */
  NO_DATA: 'NO_DATA',

  /**
   * Export the state with all the data included, and without any external references.
   * The final file will be a zip, containing all the data, including the original files.
   * External data source will also be embedded in the archive.
   *
   * @experimental
   */
  SELF_CONTAINED: 'SELF_CONTAINED',

  /**
   * Export the state with data included and with external references.
   * Original files will be included in the final archive.
   * External data source will not be embedded in the archive.
   *
   * When the nmrium file will be imported,
   * the data will be fetched from the original source and merged with data embedded in the archive.
   *
   * @experimental
   */
  SELF_CONTAINED_EXTERNAL_DATASOURCE: 'SELF_CONTAINED_EXTERNAL_DATASOURCE',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type DataExportOptions =
  (typeof DataExportOptions)[keyof typeof DataExportOptions];

type ExportTarget = 'nmrium' | 'onChange';

export interface ExportOptions {
  dataType?: DataExportOptions;
  view?: boolean;
  settings?: boolean;
  /** @default true */
  serialize?: boolean;
  exportTarget?: ExportTarget;
}

function getData(datum: any, usedColors: any) {
  const dimension = datum.info.dimension;
  if (dimension === 1) {
    return initiateDatum1D(datum, { usedColors });
  } else {
    assert(dimension === 2);
    return initiateDatum2D(datum, { usedColors });
  }
}

export function addJcamp(
  output: any,
  jcamp: any,
  options: any,
  usedColors: any,
) {
  options = options || {};
  const name = options?.info?.name;
  const { spectra: spectraIn } = processJCAMPDX(jcamp, {
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
 * @param core
 * @param {object} state
 * @param preferencesState
 * @param options
 *
 * @returns a state serialized or not depending on the options.
 * If serialize options is true it returns SerializedNmriumState else NmriumState
 */
export function toJSON(
  core: NMRiumCore,
  state: Pick<
    State,
    | 'data'
    | 'sources'
    | 'molecules'
    | 'correlations'
    | 'actionType'
    | 'view'
    | 'fileCollections'
  >,
  preferencesState: {
    current: Workspace;
  },
  options: ExportOptions = {},
): NmriumState | SerializedNmriumState {
  const {
    sources,
    data = [],
    molecules: mols = [],
    correlations = {},
    actionType = '',
  } = state;

  const {
    dataType = 'RAW_DATA',
    view = false,
    settings = false,
    serialize = true,
    exportTarget = 'nmrium',
  } = options;

  const molecules = mols.map((mol: Molecule.StateMoleculeExtended) =>
    Molecule.toJSON(mol),
  );

  const nmriumState: NmriumState = {
    version: CURRENT_EXPORT_VERSION,
    data: {
      ...(exportTarget === 'onChange' ? { actionType } : {}),
      sources: Object.entries(sources ?? {}).map(([id, source]) => ({
        ...source,
        id,
      })),
      spectra: data,
      molecules,
      correlations,
    },
    view: state.view,
    settings: preferencesState.current,
    plugins: core.serializePlugins(),
  };

  if (!serialize) {
    return nmriumState;
  } else {
    const includeData = dataTypeToIncludeData(dataType);

    return core.serializeNmriumState(nmriumState, {
      includeData,
      includeSettings: settings,
      includeView: view,
    });
  }
}

function dataTypeToIncludeData(dataType: DataExportOptions): IncludeData {
  switch (dataType) {
    case 'RAW_DATA':
      return 'rawData';
    case 'NO_DATA':
      return 'noData';
    case 'DATA_SOURCE':
      return 'dataSource';
    case 'SELF_CONTAINED':
      return 'selfContained';
    case 'SELF_CONTAINED_EXTERNAL_DATASOURCE':
      return 'selfContainedExternalDatasource';
    default:
      throw new Error(`Unknown dataType ${dataType as string}`);
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

  jcamp = spectrum1DToJCAMPDX(exportedSpectrum, {
    onlyReal,
  });

  if (!jcamp) {
    throw new Error('convert spectrum to JCAMP failed');
  }

  const blob = new Blob([jcamp], { type: 'text/plain' });
  saveAs({ blob, name: spectrum.info.name, extension: '.jdx' });
}

interface ExportForCTOptions {
  spectrum: Spectrum;
  molecules: StateMolecule[];
}

export async function exportForCT(options: ExportForCTOptions) {
  const { spectrum, molecules } = options;

  if (!isSpectrum1D(spectrum)) {
    throw new Error('2D spectrum is not supported');
  }
  if (!spectrum.info.isFt) {
    throw new Error('The spectrum must be a Fourier Transform (FT) spectrum.');
  }
  if (!(Array.isArray(molecules) && molecules.length > 0)) {
    throw new Error('Molecule file is required. Please add a molecule');
  }

  const jcamp = spectrum1DToJCAMPDX(spectrum, {
    onlyReal: true,
  });

  if (!jcamp) {
    throw new Error('Failed to convert the 1D spectrum to JCAMP');
  }
  const name = spectrum.info.name;
  const zip = new ZipWriter(new BlobWriter());

  //add jcamp file
  await zip.add(`${name}.dx`, new TextReader(jcamp));
  //add mol file
  const { molfile } = molecules[0];
  const molecule = OCL.Molecule.fromMolfile(molfile);
  const molFileName = molecule.getMolecularFormula().formula;
  const ctMolfile = molecule.toMolfile({
    includeCustomAtomLabelsAsALines: true,
    customLabelPosition: 'normal',
  });

  await zip.add(`${molFileName}.mol`, new TextReader(ctMolfile));

  const blob = await zip.close();
  saveAs({ blob, name, extension: '.zip' });
}

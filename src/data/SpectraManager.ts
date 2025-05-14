import type {
  NMRiumCore,
  Spectrum,
  StateMolecule,
  Workspace,
} from '@zakodium/nmrium-core';
import { CURRENT_EXPORT_VERSION } from '@zakodium/nmrium-core';
import {
  processJCAMPDX,
  spectrum1DToJCAMPDX,
} from '@zakodium/nmrium-core-plugins';
import fileSaver from 'file-saver';
import JSZip from 'jszip';
import * as OCL from 'openchemlib';

import type { State } from '../component/reducer/Reducer.js';

import { initiateDatum1D, isSpectrum1D } from './data1d/Spectrum1D/index.js';
import { initiateDatum2D } from './data2d/Spectrum2D/index.js';
import * as Molecule from './molecules/Molecule.js';

export enum DataExportOptions {
  ROW_DATA = 'ROW_DATA',
  DATA_SOURCE = 'DATA_SOURCE',
  NO_DATA = 'NO_DATA',
}

type DataExportOptionsType = keyof typeof DataExportOptions;

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
 */
export function toJSON(
  core: NMRiumCore,
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

    return core.serializeNmriumState(nmriumState, {
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
  const { originalData, originalInfo, meta, ...otherSpectrum } = spectrum;

  const exportedSpectrum: Spectrum = { ...otherSpectrum, meta: {} };

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
  fileSaver.saveAs(blob, `${spectrum.info.name}.jdx`);
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
  const zip = new JSZip();

  //add jcamp file
  zip.file(`${name}.dx`, jcamp);
  //add mol file
  const { molfile } = molecules[0];
  const molecule = OCL.Molecule.fromMolfile(molfile);
  const molFileName = molecule.getMolecularFormula().formula;

  zip.file(`${molFileName}.mol`, molecule.toMolfile());

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  fileSaver.saveAs(blob, name);
}

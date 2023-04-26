import { saveAs } from 'file-saver';
import {
  processJcamp,
  serializeNmriumState,
  CURRENT_EXPORT_VERSION,
  Spectrum,
  spectrum1DToJcamp,
} from 'nmr-load-save';

import { State } from '../component/reducer/Reducer';
import { Workspace } from '../component/workspaces/Workspace';

import { lookupForFilter } from './FiltersManager';
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
  for (let spectrum of spectraIn) {
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

export function exportAsJcamp(spectrum: Spectrum) {
  let jcamp: string | null = null;
  if (isSpectrum1D(spectrum)) {
    const { info, data } = spectrum;
    const {
      pulseSequence,
      isFid,
      spectralWidth,
      frequencyOffset,
      DECIM,
      DSPFVS,
    } = info;
    const nucleus = getFirstIfArray(info.nucleus);
    const baseFrequency = getFirstIfArray(info.baseFrequency);
    const originFrequency = getFirstIfArray(info.originFrequency);
    const infoToExport: any = {
      nucleus,
      pulseSequence,
      baseFrequency,
      originFrequency,
      isFid,
    };
    let newMeta: any = {};
    const { re, im } = data;
    const newRe = new Float64Array(re);
    const newIm = im ? new Float64Array(im) : undefined;
    if (isFid) {
      maybeAdd(newMeta, 'BF1', baseFrequency);
      maybeAdd(newMeta, 'SW', spectralWidth);
      const digitalFiltering = lookupForFilter(spectrum, 'digitalFilter');

      if (digitalFiltering) {
        const {
          value: { digitalFilterValue },
          flag: digitalFilterIsApplied,
        } = digitalFiltering;

        if (digitalFilterIsApplied) {
          let pointsToShift = Math.floor(digitalFilterValue);
          newRe.set(re.slice(re.length - pointsToShift));
          newRe.set(re.slice(0, re.length - pointsToShift), pointsToShift);
          if (im && newIm) {
            newIm.set(im.slice(im.length - pointsToShift));
            newIm.set(im.slice(0, im.length - pointsToShift), pointsToShift);
          }
        }
        maybeAdd(newMeta, 'GRPDLY', digitalFilterValue);
        maybeAdd(newMeta, 'DECIM', DECIM);
        maybeAdd(newMeta, 'DSPFVS', DSPFVS);
      }
      if (frequencyOffset && baseFrequency) {
        const offset = frequencyOffset / baseFrequency;
        infoToExport.shiftReference = offset + 0.5 * spectralWidth; 
      } else {
        infoToExport.shiftReference = data.x[re.length - 1];
      }
      
    }
    jcamp = spectrum1DToJcamp({
      ...spectrum,
      data: {
        ...data,
        re: newRe,
        im: newIm,
      },
      info: infoToExport,
      meta: newMeta,
    });
  } else {
    throw new Error('convert 2D spectrum to JCAMP is not supported');
  }

  if (!jcamp) {
    throw new Error('convert spectrum to JCAMP failed');
  }

  const blob = new Blob([jcamp], { type: 'text/plain' });
  saveAs(blob, `${spectrum.info.name}.jdx`);
}

function getFirstIfArray(data: any) {
  return Array.isArray(data) ? data[0] : data;
}

function maybeAdd(
  obj: any,
  name: string,
  value?: string | number | Array<string | number>,
) {
  if (value === undefined) return;
  obj[name] = getFirstIfArray(value);
}

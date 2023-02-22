import {
  processJcamp,
  serializeNmriumState,
  CURRENT_EXPORT_VERSION,
} from 'nmr-load-save';

import { State } from '../component/reducer/Reducer';
import { Workspace } from '../component/workspaces/Workspace';

import * as Datum1D from './data1d/Spectrum1D';
import * as Datum2D from './data2d/Spectrum2D';
import * as Molecule from './molecules/Molecule';
import { Datum1D as Datum1DType } from './types/data1d';
import { Datum2D as Datum2DType } from './types/data2d';

export enum DataExportOptions {
  ROW_DATA = 'ROW_DATA',
  DATA_SOURCE = 'DATA_SOURCE',
  NO_DATA = 'NO_DATA',
}

export type DataExportOptionsType = keyof typeof DataExportOptions;

export interface ExportOptions {
  dataType?: DataExportOptionsType;
  view?: boolean;
  settings?: boolean;
}

function getData(datum, usedColors) {
  const dimension = datum.info.dimension;
  if (dimension === 1) {
    return Datum1D.initiateDatum1D(datum, { usedColors });
  } else if (dimension === 2) {
    return Datum2D.initiateDatum2D(datum, { usedColors });
  }
}

export function addJcampFromURL(spectra, jcampURL, options, usedColors) {
  return fetch(jcampURL)
    .then((response) => response.arrayBuffer())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options, usedColors);
    });
}

export function addJcamp(output, jcamp, options, usedColors) {
  options = options || {};
  const name = options?.display?.name;
  const { spectra: spectraIn } = processJcamp(jcamp, {
    name,
    converter: {
      keepRecordsRegExp: /.*/,
      profiling: true,
    },
  });
  if (spectraIn.length === 0) return;

  const spectra: Array<Datum1DType | Datum2DType> = [];
  for (let spectrum of spectraIn) {
    const data = getData(spectrum, usedColors);
    if (!data) continue;
    spectra.push(data);
  }
  output.push(...spectra);
}

export function addJcamps(files, usedColors) {
  const spectra = [];
  for (const file of files) {
    addJcamp(
      spectra,
      file.binary,
      {
        display: {
          name: file.name,
        },
        source: {
          jcampURL: file.jcampURL || null,
          file,
        },
      },
      usedColors,
    );
  }
  return spectra;
}

/**
 *
 * @param {object} state
 */

type JSONTarget = 'nmrium' | 'onDataChange';

export function toJSON(
  state: State,
  preferencesState: Partial<{
    current: Workspace;
  }>,
  target: JSONTarget,
  options: ExportOptions = {},
) {
  const {
    source,
    data = [],
    molecules: mols = [],
    correlations = {},
    actionType = '',
  } = state;

  const { dataType = 'ROW_DATA', view = false, settings = false } = options;

  const molecules = mols.map((mol: Molecule.StateMoleculeExtended) =>
    Molecule.toJSON(mol),
  );

  const nmriumState: any = {
    version: CURRENT_EXPORT_VERSION,
    data: {
      ...(target === 'onDataChange' ? { actionType } : {}),
      source,
      spectra: data,
      molecules,
      correlations,
    },
    view: state.view,
    settings: preferencesState.current,
  };

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

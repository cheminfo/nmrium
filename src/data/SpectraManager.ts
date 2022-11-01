import { CURRENT_EXPORT_VERSION, processJcamp } from 'nmr-load-save';

import { State } from '../component/reducer/Reducer';
import { DISPLAYER_MODE } from '../component/reducer/core/Constants';
import { NMRiumDataReturn } from '../types/NMRiumDataReturn';
import { Preferences } from '../types/Preferences';

import { SpectraAnalysis } from './data1d/MultipleAnalysis';
import * as Datum1D from './data1d/Spectrum1D';
import * as Datum2D from './data2d/Spectrum2D';
import * as Molecule from './molecules/Molecule';
import { Datum1D as Datum1DType } from './types/data1d';
import { Datum2D as Datum2DType } from './types/data2d';

export enum DataExportOptions {
  ROW_DATA = 'ROW_DATA',
  DATA_SOURCE = 'DATA_SOURCE',
}

export type DataExportOptionsType = keyof typeof DataExportOptions;

function getData(datum, usedColors) {
  const dimension = datum.info.dimension;

  if (dimension === 1) {
    return Datum1D.initiateDatum1D(datum, usedColors);
  } else if (dimension === 2) {
    return Datum2D.initiateDatum2D(datum, usedColors);
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
    noContour: true,
    keepRecordsRegExp: /.*/,
    profiling: true,
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
function getPreferences(state): Preferences {
  const {
    activeTab,
    verticalAlign: { align },
    displayerMode,
  } = state;
  return {
    activeTab,
    ...(displayerMode === DISPLAYER_MODE.DM_1D ? { verticalAlign: align } : {}),
  };
}

/**
 *
 * @param {object} state
 */

type JSONTarget = 'nmrium' | 'onDataChange';

export function toJSON(
  state: State,
  target: JSONTarget,
  dataExportOption: DataExportOptionsType = DataExportOptions.DATA_SOURCE,
): NMRiumDataReturn {
  const {
    data = [],
    molecules: mols = [],
    correlations = {},
    spectraAnalysis: multipleAnalysis = [],
    actionType = '',
  } = state;
  const spectra = data.map((ob) => {
    return ob.info.dimension === 1
      ? (Datum1D.toJSON(ob as Datum1DType, dataExportOption) as Datum1DType)
      : (Datum2D.toJSON(ob as Datum2DType, dataExportOption) as Datum2DType);
  });

  const preferences = getPreferences(state);
  const molecules = mols.map((mol: Molecule.StateMoleculeExtended) =>
    Molecule.toJSON(mol),
  );

  return {
    ...(target === 'onDataChange' ? { actionType } : {}),
    version: CURRENT_EXPORT_VERSION,
    spectra,
    molecules,
    correlations,
    multipleAnalysis: multipleAnalysis as SpectraAnalysis,
    preferences,
  };
}

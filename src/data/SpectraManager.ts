import { fromJEOL, fromJCAMP, fromBruker } from 'nmr-parser';

import { DISPLAYER_MODE } from '../component/reducer/core/Constants';
import { NMRiumDataReturn } from '../types/NMRiumDataReturn';
import { Preferences } from '../types/Preferences';

import * as Data1DManager from './data1d/Data1DManager';
import * as Datum1D from './data1d/Spectrum1D';
import * as Data2DManager from './data2d/Data2DManager';
import * as Datum2D from './data2d/Spectrum2D';
import { CURRENT_EXPORT_VERSION } from './migration/MigrationManager';
import * as Molecule from './molecules/Molecule';

export enum DataExportOptions {
  ROW_DATA = 'ROW_DATA',
  DATA_SOURCE = 'DATA_SOURCE',
}

export type DataExportOptionsType = keyof typeof DataExportOptions;

export function addJcampFromURL(spectra, jcampURL, options, usedColors) {
  return fetch(jcampURL)
    .then((response) => response.arrayBuffer())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options, usedColors);
    });
}

export function addJcamp(spectra, jcamp, options, usedColors) {
  options = options || {};
  const entries = fromJCAMP(jcamp, {
    noContour: true,
    xy: true,
    keepRecordsRegExp: /.*/,
    profiling: true,
  });
  if (entries.length === 0) return;
  // Should be improved when we have a more complex case
  for (let index = 0; index < entries.length; index++) {
    let entry = entries[index];

    const components = entry.dependentVariables?.[0]?.components;
    if (components && (components.length > 0 || components.z)) {
      addJcampSS(spectra, { index, entry }, options, usedColors);
    }
  }
}

function addJcampSS(spectra, jcampDatum, options, usedColors) {
  const source = options?.source || {};

  if (
    !('jcampSpectrumIndex' in source) ||
    source.jcampSpectrumIndex === jcampDatum.index
  ) {
    const dimension = jcampDatum.entry.info.dimension;

    if (dimension === 1) {
      spectra.push(
        Data1DManager.fromParsedJcamp(
          jcampDatum.entry,
          options,
          usedColors,
          jcampDatum.index,
        ),
      );
    }
    if (dimension === 2) {
      // console.log(options, jcampDatum.entry);

      spectra.push(
        Data2DManager.fromParsedJcamp(
          jcampDatum.entry,
          options,
          usedColors,
          jcampDatum.index,
        ),
      );
    }
  }
}

function addData(spectra, datum, usedColors) {
  const dimension = datum.info.dimension;
  if (dimension === 1) {
    spectra.push(Datum1D.initiateDatum1D(datum, usedColors));
  }
  if (dimension === 2) {
    spectra.push(Datum2D.initiateDatum2D(datum, usedColors));
  }
}

export function addJDF(spectra, jdf, options: any = {}, usedColors: any = {}) {
  // need to parse the jcamp
  let converted = fromJEOL(jdf, {});
  converted = converted[0];
  let info = converted.description;
  let metadata = info.metadata;
  delete info.metadata;
  info.acquisitionMode = 0;
  info.experiment = info.dimension === 1 ? '1d' : '2d';
  info.type = 'NMR SPECTRUM';
  info.nucleus = info.nucleus[0];
  info.numberOfPoints = info.numberOfPoints[0];
  info.acquisitionTime = info.acquisitionTime[0];

  info.baseFrequency = info.baseFrequency[0];
  info.frequencyOffset = info.frequencyOffset[0];

  info.spectralWidthClipped = converted.application.spectralWidthClipped;

  if (info.dimension === 1) {
    if (converted.dependentVariables) {
      spectra.push(
        Data1DManager.fromCSD(
          converted,
          {
            ...options,
            display: { ...options.display },
            info,
            meta: metadata,
          },
          usedColors,
        ),
      );
    }
  }
  if (info.dimension === 2 && info.isFt) {
    spectra.push(
      Data2DManager.fromCSD(
        converted,
        {
          ...options,
          display: { ...options.display },
          info,
        },
        usedColors,
      ),
    );
  }
}

export async function fromJSON(data: any[] = [], usedColors: any = {}) {
  const spectra: any[] = [];
  let promises: any[] = [];

  for (let datum of data) {
    const { jcamp, jcampURL } = datum?.source || {};
    if (jcamp != null) {
      addJcamp(spectra, jcamp, datum, usedColors);
    } else if (jcampURL != null) {
      promises.push(addJcampFromURL(spectra, jcampURL, datum, usedColors));
    } else {
      addData(spectra, datum, usedColors);
    }
  }
  await Promise.all(promises);
  return spectra;
}

export async function addBruker(options, data, usedColors) {
  const spectra: any[] = [];
  let result = await fromBruker(data, {
    converter: {
      xy: true,
    },
  });
  let entries = result;
  for (let entry of entries) {
    let { info, dependentVariables } = entry;
    if (info.dimension === 1) {
      if (dependentVariables[0].components) {
        spectra.push(
          Data1DManager.fromBruker(
            entry,
            {
              ...options,
              display: { ...options.display },
            },
            usedColors,
          ),
        );
      }
    } else if (info.dimension === 2) {
      if (info.isFt) {
        spectra.push(
          Data2DManager.fromBruker(
            entry,
            {
              ...options,
              info,
              display: { ...options.display },
            },
            usedColors,
          ),
        );
      } else {
        // in case of 2D FID spectrum
      }
    }
  }
  return spectra;
}

// handle zip files
export async function fromZip(zipFiles) {
  const spectra = [];
  for (let zipFile of zipFiles) {
    await addBruker(
      spectra,
      { display: { name: zipFile.name } },
      zipFile.binary,
    );
  }
  return spectra;
}

export function addJDFs(files, usedColors) {
  const spectra = [];
  for (const file of files) {
    addJDF(
      spectra,
      file.binary,
      {
        display: {
          name: file.name,
        },
        source: {
          jcampURL: file.jcampURL ? file.jcampURL : null,
          file,
        },
      },
      usedColors,
    );
  }
  return spectra;
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
          jcampURL: file.jcampURL ? file.jcampURL : null,
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
  } = state;
  return {
    activeTab,
    ...(state.displayerMode === DISPLAYER_MODE.DM_1D
      ? { verticalAlign: align }
      : {}),
  };
}

/**
 *
 * @param {object} state
 */

type JSONTarget = 'nmrium' | 'onDataChange';

export function toJSON(
  state,
  target: JSONTarget,
  dataExportOption: DataExportOptionsType = DataExportOptions.DATA_SOURCE,
): NMRiumDataReturn {
  const {
    data,
    molecules: mols,
    correlations,
    multipleAnalysis,
    actionType,
  } = state || {
    data: [],
    molecules: [],
    correlations: {},
    multipleAnalysis: {},
    actionType: '',
  };
  const spectra = data.map((ob) => {
    return ob.info.dimension === 1
      ? Datum1D.toJSON(ob, dataExportOption)
      : Datum2D.toJSON(ob, dataExportOption);
  });

  const preferences = getPreferences(state);
  const molecules = mols.map((mol) => Molecule.toJSON(mol));

  return {
    ...(target === 'onDataChange' ? { actionType } : {}),
    version: CURRENT_EXPORT_VERSION,
    spectra,
    molecules,
    correlations,
    multipleAnalysis,
    preferences,
  };
}

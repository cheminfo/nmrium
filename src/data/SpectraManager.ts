import { fromJEOL, fromJCAMP, fromBruker } from 'nmr-parser';

import * as Data1DManager from './data1d/Data1DManager';
import * as Datum1D from './data1d/Spectrum1D';
import * as Data2DManager from './data2d/Data2DManager';
import * as Datum2D from './data2d/Spectrum2D';
import { CURRENT_EXPORT_VERSION } from './migration';
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
  for (let entry of entries) {
    let { dependentVariables } = entry;
    if (
      dependentVariables[0].components &&
      (dependentVariables[0].components.length > 0 ||
        dependentVariables[0].components.z.length)
    ) {
      addJcampSS(spectra, entry, options, usedColors);
    }
  }
}

function addJcampSS(spectra, entry, options, usedColors) {
  const dimension = entry.info.dimension;
  if (dimension === 1) {
    spectra.push(Data1DManager.fromParsedJcamp(entry, options, usedColors));
  }
  if (dimension === 2) {
    spectra.push(Data2DManager.fromParsedJcamp(entry, options, usedColors));
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
            info: info,
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
    if (datum.source.jcampURL != null) {
      promises.push(
        addJcampFromURL(spectra, datum.source.jcampURL, datum, usedColors),
      );
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
    xy: true,
    noContours: true,
    keepOriginal: true,
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

/**
 *
 * @param {object} state
 */
export function toJSON(
  state,
  dataExportOption: DataExportOptionsType = DataExportOptions.DATA_SOURCE,
) {
  const {
    data,
    molecules: mols,
    preferences,
    correlations,
    multipleAnalysis,
    toolOptions: {
      data: { exclusionZones },
    },
  } = state || {
    data: [],
    molecules: [],
    preferences: {},
    correlations: {},
    multipleAnalysis: {},
    exclusionZones: {},
  };
  const spectra = data.map((ob) => {
    return ob.info.dimension === 1
      ? Datum1D.toJSON(ob, dataExportOption)
      : Datum2D.toJSON(ob, dataExportOption);
  });

  const molecules = mols.map((mol) => Molecule.toJSON(mol));

  return {
    spectra,
    molecules,
    preferences,
    correlations,
    multipleAnalysis,
    exclusionZones,
    version: CURRENT_EXPORT_VERSION,
  };
}

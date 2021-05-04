import { fromJEOL, fromJCAMP, fromBruker } from 'nmr-parser';

import * as Data1DManager from './data1d/Data1DManager';
import * as Datum1D from './data1d/Datum1D';
import * as Data2DManager from './data2d/Data2DManager';
import * as Datum2D from './data2d/Datum2D';
import * as Molecule from './molecules/Molecule';

export function addJcampFromURL(spectra, jcampURL, options) {
  // { credentials: 'include' }
  return fetch(jcampURL)
    .then((response) => response.arrayBuffer())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options);
    });
}

export function addJcamp(spectra, jcamp, options = {}) {
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
      addJcampSS(spectra, entry, options);
    }
  }
}

function addJcampSS(spectra, entry, options) {
  const dimension = entry.info.dimension;
  if (dimension === 1) {
    spectra.push(Data1DManager.fromParsedJcamp(entry, options));
  }
  if (dimension === 2) {
    spectra.push(Data2DManager.fromParsedJcamp(entry, options));
  }
}

function addData(spectra, datum) {
  const dimension = datum.info.dimension;
  if (dimension === 1) {
    spectra.push(Datum1D.initiateDatum1D(datum));
  }
  if (dimension === 2) {
    spectra.push(Datum2D.initiateDatum2D(datum));
  }
}

export function addJDF(spectra, jdf, options = {}) {
  // need to parse the jcamp
  let converted = fromJEOL(jdf, {});
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
        Data1DManager.fromCSD(converted, {
          ...options,
          display: { ...options.display },
          info: info,
          meta: metadata,
        }),
      );
    }
  }
  if (info.dimension === 2 && info.isFt) {
    spectra.push(
      Data2DManager.fromCSD(converted, {
        ...options,
        display: { ...options.display },
        info,
      }),
    );
  }
}

export async function fromJSON(data = []) {
  const spectra = [];
  let promises = [];

  for (let datum of data) {
    if (datum.source.jcampURL != null) {
      promises.push(addJcampFromURL(spectra, datum.source.jcampURL, datum));
    } else {
      addData(spectra, datum);
    }
  }
  await Promise.all(promises);
  return spectra;
}

export async function addBruker(options, data) {
  const spectra = [];
  let result = await fromBruker(data, { xy: true, noContours: true });

  let entries = result;
  for (let entry of entries) {
    let { info, dependentVariables } = entry;
    if (info.dimension === 1) {
      if (dependentVariables[0].components) {
        spectra.push(
          Data1DManager.fromBruker(entry, {
            ...options,
            display: { ...options.display },
          }),
        );
      }
    } else if (info.dimension === 2) {
      if (info.isFt) {
        spectra.push(
          Data2DManager.fromBruker(entry, {
            ...options,
            info,
            display: { ...options.display },
          }),
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

export function addJDFs(files) {
  const spectra = [];
  for (const file of files) {
    addJDF(spectra, file.binary, {
      display: {
        name: file.name,
      },
      source: {
        jcampURL: file.jcampURL ? file.jcampURL : null,
        file,
      },
    });
  }
  return spectra;
}

export function addJcamps(files) {
  const spectra = [];
  for (const file of files) {
    addJcamp(spectra, file.binary, {
      display: {
        name: file.name,
      },
      source: {
        jcampURL: file.jcampURL ? file.jcampURL : null,
        file,
      },
    });
  }
  return spectra;
}

export async function addMolfileFromURL(molfileURL) {
  let molfile = await fetch(molfileURL).then((response) => response.text());
  this.addMolfile(molfile);
}

/**
 *
 * @param {object} state
 */
export function toJSON(state, forceIncludeData = false) {
  const {
    data,
    molecules: mols,
    preferences,
    correlations,
    multipleAnalysis,
    exclusionZones,
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
      ? Datum1D.toJSON(ob, forceIncludeData)
      : Datum2D.toJSON(ob, forceIncludeData);
  });

  const molecules = mols.map((mol) => Molecule.toJSON(mol));

  return {
    spectra,
    molecules,
    preferences,
    correlations,
    multipleAnalysis,
    exclusionZones,
  };
}

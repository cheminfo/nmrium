import { fromJEOL, fromJCAMP, fromBruker } from 'nmr-parser';

import { Data1DManager } from './data1d/Data1DManager';
import { Datum1D } from './data1d/Datum1D';
import { Data2DManager } from './data2d/Data2DManager';
import { Datum2D } from './data2d/Datum2D';
import getColor, { adjustAlpha } from './utilities/getColor';

export function addJcampFromURL(spectra, jcampURL, options) {
  return fetch(jcampURL, { credentials: 'include' })
    .then((response) => response.text())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options);
    });
}

export function addJcamp(spectra, jcamp, options = {}) {
  // need to parse the jcamp
  let entries = fromJCAMP(jcamp, {
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
    spectra.push(new Datum1D({ ...datum, data: datum.source.original }));
  }
  if (dimension === 2) {
    spectra.push(new Datum2D({ ...datum, data: datum.source.original }));
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
  info.frequencyOffset = info.offset[0];

  info.spectralWidthClipped = converted.application.spectralWidthClipped;

  if (info.dimension === 1) {
    let usedcolors1D = [];
    if (converted.dependentVariables) {
      const color = getColor(usedcolors1D);
      spectra.push(
        Data1DManager.fromCSD(converted, {
          ...options,
          display: { ...options.display, color },
          info: info,
          meta: metadata,
        }),
      );
      usedcolors1D.push(color);
    }
  }
  if (info.dimension === 2 && info.isFt) {
    let usedcolors2d = [];
    const positiveColor = getColor(false, usedcolors2d);
    const negativeColor = adjustAlpha(positiveColor, 50);
    usedcolors2d.push(positiveColor);

    spectra.push(
      Data2DManager.fromCSD(converted, {
        ...options,
        display: { ...options.display, positiveColor, negativeColor },
        info,
      }),
    );
  }
}

export async function fromJSON(spectra, data = []) {
  let promises = [];
  for (let datum of data) {
    if (datum.source.jcamp != null) {
      addJcamp(spectra, datum.source.jcamp, datum);
    } else if (datum.source.jcampURL != null) {
      promises.push(addJcampFromURL(spectra, datum.source.jcampURL, datum));
    } else {
      addData(spectra, datum);
    }
  }
  await Promise.all(promises);
}

export async function addBruker(spectra, options, data) {
  let result = await fromBruker(data, { xy: true, noContours: true });
  const usedcolors1D = [];
  const usedcolors2d = [];
  let entries = result;
  for (let entry of entries) {
    let { info, dependentVariables } = entry;
    if (info.dimension === 1) {
      if (dependentVariables[0].components) {
        const color = getColor(usedcolors1D);
        spectra.push(
          Data1DManager.fromBruker(entry, {
            ...options,
            display: { ...options.display, color },
          }),
        );
        usedcolors1D.push(color);
      }
    } else if (info.dimension === 2) {
      if (info.isFt) {
        const positiveColor = getColor(false, usedcolors2d);
        const negativeColor = adjustAlpha(positiveColor, 50);
        usedcolors2d.push(positiveColor);

        spectra.push(
          Data2DManager.fromBruker(entry, {
            ...options,
            info,
            display: { ...options.display, positiveColor, negativeColor },
          }),
        );
      } else {
        // in case of 2D FID spectrum
      }
    }
  }
}

import { convertZip as convertBruker } from 'brukerconverter';
import { convert } from 'jcampconverter';

import { Data1DManager } from './data1d/Data1DManager';
import { Datum1D } from './data1d/Datum1D';
import { Data2DManager } from './data2d/Data2DManager';
import getColor, { adjustAlpha } from './utilities/getColor';
import { getInfoFromMetaData } from './utilities/getInfoFromMetaData';

export function addJcampFromURL(spectra, jcampURL, options) {
  return fetch(jcampURL)
    .then((response) => response.text())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options);
    });
}

export function addJcamp(spectra, jcamp, options = {}) {
  // need to parse the jcamp
  let converted = convert(jcamp, {
    noContour: true,
    xy: true,
    keepRecordsRegExp: /.*/,
    profiling: true,
  });
  let entries = converted.flatten;
  if (entries.length === 0) return;
  // Should be improved when we have a more complex case
  for (let entry of entries) {
    if ((entry.spectra && entry.spectra.length > 0) || entry.minMax) {
      addJcampSS(spectra, entry, options);
    }
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
      spectra.push(new Datum1D({ ...datum, data: datum.source.original }));
    }
  }
  await Promise.all(promises);
}

function addJcampSS(spectra, entry, options) {
  let info = getInfoFromMetaData(entry.info);
  if (info.dimension === 1) {
    spectra.push(Data1DManager.fromParsedJcamp(entry, options));
  }
  if (info.dimension === 2) {
    spectra.push(Data2DManager.fromParsedJcamp(entry, options));
  }
}

export async function addBruker(spectra, options, data) {
  let result = await convertBruker(data, { xy: true, noContours: true });
  const usedcolors1D = [];
  const usedcolors2d = [];
  let entries = result.map((r) => r.value);
  for (let entry of entries) {
    let info = getInfoFromMetaData(entry.info);
    if (info.dimension === 1) {
      if (entry.spectra && entry.spectra.length > 0) {
        const color = getColor(usedcolors1D);
        spectra.push(
          Data1DManager.fromBruker(entry, {
            ...options,
            display: { ...options.display, color },
            info,
          }),
        );
        usedcolors1D.push(color);
      }
    }
    if (info.dimension === 2 && info.isFt) {
      const positiveColor = getColor(false, usedcolors2d);
      const negativeColor = adjustAlpha(positiveColor, 50);
      usedcolors2d.push(positiveColor);

      spectra.push(
        Data2DManager.fromBruker(entry, {
          ...options,
          display: { ...options.display, positiveColor, negativeColor },
          info,
        }),
      );
    }
  }
}

import { convertZip as convertBruker } from 'brukerconverter';
import { convert } from 'jcampconverter';
import { fromJEOL } from 'nmr-parser';

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

export function addJDF(spectra, jdf, options = {}) {
  // need to parse the jcamp
  let converted = fromJEOL(jdf, {});
  let dimensions = converted.dimensions;
  let info = converted.description;
  let metadata = info.metadata;
  console.log(metadata);

  let newInfo = {
    acquisitionMode: 0,
    bf1: info.field.magnitude,
    date: converted.timeStamp,
    dimension: dimensions.length, //info.dataDimension
    experiment: dimensions.length === 1 ? '1d' : '2d',
    expno: 'NA',
    frequency: info.frequency[0].magnitude / 1000000,
    isComplex: converted.dependentVariables[0].numericType === 'complex128',
    isFid: info.dataUnits[0] === 'Second',
    isFt: info.dataUnits[0] === 'Ppm',
    nucleus: info.nucleus[0],
    numberOfPoints: info.dataPoints[0],
    probe: info.probeId,
    pulse: info.experiment,
    sfo1: info.frequency[0].magnitude / 1000000,
    solvent: info.solvent,
    spectralWidth: info.spectralWidth[0].magnitude / info.field.magnitude,
    temperature: info.temperature.magnitude,
    title: info.title,
    type: 'NMR SPECTRUM',
    digitalFilter: info.digitalFilter,
  };

  console.log(newInfo);
  if (info.dataDimension === 1) {
    let usedcolors1D = [];
    if (converted.dependentVariables) {
      const color = getColor(usedcolors1D);
      spectra.push(
        Data1DManager.fromCSD(converted, {
          ...options,
          display: { ...options.display, color },
          info: newInfo,
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
    let { display, ...remainOptions } = options;
    if (!display.positiveColor) {
      display.positiveColor = display.color;
    }
    if (!display.negativeColor) {
      display.negativeColor = adjustAlpha(display.color, 50);
    }

    delete options.color;

    spectra.push(
      Data2DManager.fromParsedJcamp(entry, { ...remainOptions, display }),
    );
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

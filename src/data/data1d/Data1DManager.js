import { XY, XReIm } from 'ml-spectra-processing';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum1D } from './Datum1D';

export class Data1DManager {
  static fromBruker = function fromBruker(result, color, info, options = {}) {
    let data = getData(result.spectra);
    // let usedColors = data.map((d) => d.color);
    // const color = getColor(usedColors);
    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];

    const datum1D = new Datum1D({
      ...options,
      display: {
        color,
      },
      info,
      meta: result.info,
      data,
    });

    return datum1D;
  };

  static fromParsedJcamp = function fromParsedJcamp(parsedJcamp, options = {}) {
    let data = getData(parsedJcamp.spectra);
    let info = getInfoFromMetaData(parsedJcamp.info);
    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];

    const datum1D = new Datum1D({
      ...options,
      info,
      meta: parsedJcamp.info,
      data,
      source: {
        jcamp: null,
        jcampURL:
          options.source && options.source.jcampURL
            ? options.source.jcampURL
            : null,
        original: data,
      },
    });

    return datum1D;
  };
}

function getData(spectra) {
  let x =
    spectra[0] && spectra[0].data && spectra[0].data[0].x
      ? spectra[0].data[0].x
      : [];
  let re =
    spectra[0] && spectra[0].data && spectra[0].data[0].y
      ? spectra[0].data[0].y
      : [];
  let im =
    spectra[1] && spectra[1].data && spectra[1].data[0].y
      ? spectra[1].data[0].y
      : new Array(re.length);
  // 2 cases. We have real and imaginary part of only real

  return im ? XReIm.sortX({ x, re, im }) : XY.sortX({ x, re });
}

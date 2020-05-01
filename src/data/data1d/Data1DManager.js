import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum1D } from './Datum1D';

export class Data1DManager {
  static fromBruker = function fromBruker(result, options = {}) {
    const { info } = options;
    let data = getData(result.spectra);
    if (data.im) info.isComplex = true;

    if (Array.isArray(info.nucleus)) options.info.nucleus = info.nucleus[0];

    const datum1D = new Datum1D({
      ...options,
      meta: result.info,
      data,
      source: {
        jcamp: null,
        jcampURL: null,
        original: data,
      },
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
    spectra[0] && spectra[0].data && spectra[0].data.x ? spectra[0].data.x : [];
  let re =
    spectra[0] && spectra[0].data && spectra[0].data.y ? spectra[0].data.y : [];
  let im =
    spectra[1] && spectra[1].data && spectra[1].data.y
      ? spectra[1].data.y
      : null;

  if (x[0] > x[1]) {
    x.reverse();
    re.reverse();
    if (im) im.reverse();
  }
  return { x, re, im };
}

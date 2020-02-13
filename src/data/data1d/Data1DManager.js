// import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { XY, XReIm } from 'ml-spectra-processing';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum1D } from './Datum1D';

export class Data1DManager {
  static fromBruker = function fromBruker(result, info, options = {}) {
    let data = getData(result.spectra);
    const datum1D = new Datum1D({
      ...options,
      info,
      meta: result.info,
      data,
    });
    console.log(datum1D);
    return datum1D;
  };

  static fromJcamp = function fromJcamp(jcamp, options = {}) {
    let result = convert(jcamp, { xy: true, keepRecordsRegExp: /.*/ });
    let data = getData(result.spectra);
    let info = getInfoFromMetaData(result.info);

    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];

    const datum1D = new Datum1D({
      ...options,
      info,
      meta: result.info,
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
    console.log(datum1D);
    return datum1D;
  };
}

function getData(spectra) {
  let x =
    spectra[0] && spectra[0].data && spectra[0].data[0] && spectra[0].data[0].x
      ? spectra[0].data[0].x
      : [];
  let re =
    spectra[0] && spectra[0].data && spectra[0].data[0] && spectra[0].data[0].y
      ? spectra[0].data[0].y
      : [];
  let im =
    spectra[1] && spectra[1].data && spectra[1].data[0] && spectra[1].data[0].y
      ? spectra[1].data[0].y
      : new Array(re.length);
  // 2 cases. We have real and imaginary part of only real

  return im ? XReIm.sortX({ x, re, im }) : XY.sortX({ x, re });
}

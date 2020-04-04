// import applyFilter from './filter1d/filter';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum2D } from './Datum2D';

export class Data2DManager {
  static fromParsedJcamp = function fromParsedJcamp(parsedJcamp, options = {}) {
    let data = parsedJcamp.minMax;
    let info = getInfoFromMetaData(parsedJcamp.info);
    const ob = new Datum2D({
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
    return ob;
  };
}

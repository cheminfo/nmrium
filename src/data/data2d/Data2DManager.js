// import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum2D } from './Datum2D';

export class Data2DManager {
  static fromJcamp = function fromJcamp(jcamp, options = {}) {
    let result = convert(jcamp, {
      noContour: true,
      xy: true,
      keepRecordsRegExp: /.*/,
    });

    let data = result.minMax;
    let info = getInfoFromMetaData(result.info);

    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];
    const ob = new Datum2D({
      ...options,
      info,
      meta: result.info,
      data,
      source: { jcamp: null, jcampURL: null, original: data },
    });
    return ob;
  };
}

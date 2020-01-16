// import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum2D } from './Datum2D';

export class Data2DManager {
  static fromJSON = async function fromJSON(json = []) {
    let data2D = [];
    for (let i = 0; i < json.length; i++) {
      const datum = json[i];

      if (datum.source.jcamp != null) {
        const datumObject = Data2DManager.fromJcamp(datum.source.jcamp, datum);
        data2D.push(datumObject);
      } else if (datum.source.jcampURL != null) {
        data2D.push(
          Data2DManager.loadFileFromURL(datum.source.jcampURL).then((jcamp) => {
            return Data2DManager.fromJcamp(jcamp, datum);
          }),
        );
      } else {
        data2D.push(new Datum2D({ ...datum, data: datum.source.original }));
      }
    }

    return Promise.all(data2D);
  };

  static loadFileFromURL = async function loadFileFromURL(Url) {
    return fetch(Url).then(
      (response) => Data2DManager.checkStatus(response) && response.text(),
    );
  };

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
  }

  static fromJcamp = function fromJcamp(text, options = {}) {
    let result = convert(text, {
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

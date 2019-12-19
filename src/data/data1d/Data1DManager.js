// import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { XY, XReIm } from 'ml-spectra-processing';

import { getInfoFromMetaData } from '../utilities/getInfoFromMetaData';

import { Datum1D } from './Datum1D';

export class Data1DManager {
  static fromJSON = async function fromJSON(json = []) {
    let data1D = [];
    for (let i = 0; i < json.length; i++) {
      const datum = json[i];

      if (datum.source.jcamp != null) {
        const datumObject = Data1DManager.fromJcamp(datum.source.jcamp, datum);
        data1D.push(datumObject);
      } else if (datum.source.jcampURL != null) {
        data1D.push(
          Data1DManager.loadFileFromURL(datum.source.jcampURL).then((jcamp) => {
            return Data1DManager.fromJcamp(jcamp, datum);
          }),
        );
      } else {
        data1D.push(new Datum1D({ ...datum, data: datum.source.original }));
      }
    }

    return Promise.all(data1D);
  };

  static loadFileFromURL = async function loadFileFromURL(Url) {
    return fetch(Url).then(
      (response) => Data1DManager.checkStatus(response) && response.text(),
    );
  };

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    return response;
  }

  static fromJcamp = function fromJcamp(text, options = {}) {
    let result = convert(text, { xy: true, keepRecordsRegExp: /.*/ });

    let x =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].x
        ? result.spectra[0].data[0].x
        : [];
    let re =
      result.spectra[0] &&
      result.spectra[0].data &&
      result.spectra[0].data[0] &&
      result.spectra[0].data[0].y
        ? result.spectra[0].data[0].y
        : [];
    let im =
      result.spectra[1] &&
      result.spectra[1].data &&
      result.spectra[1].data[0] &&
      result.spectra[1].data[0].y
        ? result.spectra[1].data[0].y
        : new Array(re.length);
    // 2 cases. We have real and imaginary part of only real

    let data = im ? XReIm.sortX({ x, re, im }) : XY.sortX({ x, re });
    let info = getInfoFromMetaData(result.info);

    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];
    const ob = new Datum1D({
      ...options,
      info,
      meta: result.info,
      data,
      source: { jcamp: null, jcampURL: null, original: data },
    });

    return ob;
  };
}

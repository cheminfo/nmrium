// import applyFilter from './filter1d/filter';
import { convert } from 'jcampconverter';
import { Datum1D } from './Datum1D';
import { XY, XReIm } from 'ml-spectra-processing';
import { getMetaData } from './metadata/getMetaData';
export class Data1DManager {

  static fromJSON = function fromJSON(json = []) {
    let data1D = [];
    json.forEach((datum) => {
      data1D.push(new Datum1D(datum.data,datum.options));
    });
    return data1D;
  };


  static fromJcamp = function fromJcamp(
    text,
    name,
    color,
    isVisible,
    isPeaksMarkersVisible,
  ) {
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

    let meta = getMetaData(result.info);

    if (Array.isArray(meta.nucleus)) meta.nucleus = meta.nucleus[0];

    const ob = new Datum1D(data, {
      display: {
        name: name,
        color: color,
        isVisible: isVisible,
        isPeaksMarkersVisible: isPeaksMarkersVisible,
      },
      info: meta,
    });

    return ob;
  };




}

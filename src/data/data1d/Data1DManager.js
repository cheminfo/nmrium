import { Datum1D } from './Datum1D';

export class Data1DManager {
  static fromBruker = function fromBruker(result, options = {}) {
    const { dependentVariables, info, meta } = result;
    let data = getData(dependentVariables[0].components);
    if (data.im) info.isComplex = true;

    if (Array.isArray(info.nucleus)) options.info.nucleus = info.nucleus[0];

    const datum1D = new Datum1D({
      ...options,
      info,
      meta,
      data,
      source: {
        jcamp: null,
        jcampURL: null,
        original: data,
      },
    });

    return datum1D;
  };

  static fromCSD = function fromCSD(result, options = {}) {
    let dimension = result.dimensions[0];
    let dependentVariables = result.dependentVariables;

    let quantityName = dimension.quantityName;
    let n = dimension.count;
    let incr = dimension.increment.magnitude;
    let origin = dimension.originOffset.magnitude;
    let offset = dimension.coordinatesOffset.magnitude;

    let buffer = dependentVariables[0].components[0];
    let re = [];
    let im = [];
    for (let i = buffer.length - 1; i > 0; i -= 2) {
      re.push(buffer[i - 1]);
      im.push(buffer[i]);
    }

    let data = {};
    let i, x0;
    switch (quantityName) {
      case 'frequency':
        x0 = 0 + (offset / origin) * 1000000;
        i = (incr / origin) * 1000000;
        data.re = re;
        data.im = im;
        break;
      case 'time':
        x0 = origin;
        i = incr;
        data.re = re.reverse();
        data.im = im.reverse().map((z) => -z);
        break;
      default:
        break;
    }

    let scale = [];
    for (let x = 0; x < n; x++) {
      scale.push(x0 + x * i);
    }

    data.x = scale;

    const datum1D = new Datum1D({
      ...options,
      meta: options.meta,
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
    const { dependentVariables, info, meta } = parsedJcamp;
    let data = getData(dependentVariables[0].components);
    if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];
    const datum1D = new Datum1D({
      ...options,
      info,
      meta,
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

import { Datum2D } from './Datum2D';

export class Data2DManager {
  static fromParsedJcamp = function fromParsedJcamp(parsedJcamp, options = {}) {
    const { dependentVariables, info } = parsedJcamp;
    let data = dependentVariables[0].components;
    const ob = new Datum2D({
      ...options,
      info,
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

  static fromBruker = function fromBruker(result, options = {}) {
    const { dependentVariables, info } = result;
    let data = dependentVariables[0].components;
    const datum2D = new Datum2D({
      ...options,
      info,
      data,
      source: {
        jcamp: null,
        jcampURL: null,
        original: data,
      },
    });

    return datum2D;
  };
}

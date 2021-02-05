import { initiateDatum2D } from './Datum2D';

export class Data2DManager {
  static fromParsedJcamp = function fromParsedJcamp(parsedJcamp, options = {}) {
    const { dependentVariables, info, meta } = parsedJcamp;
    let data = dependentVariables[0].components;
    const ob = initiateDatum2D({
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
    return ob;
  };

  static fromBruker = function fromBruker(result, options = {}) {
    const { dependentVariables, meta } = result;
    let data = dependentVariables[0].components;
    const datum2D = initiateDatum2D({
      ...options,
      meta,
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

import { initiateDatum2D } from './Spectrum2D';

export function fromParsedJcamp(
  parsedJcamp,
  options,
  usedColors,
  jcampSpectrumIndex: number,
) {
  const { dependentVariables, info, meta } = parsedJcamp;
  let data = dependentVariables[0].components;
  const ob = initiateDatum2D(
    {
      ...options,
      source: { ...options?.source, jcampSpectrumIndex },
      display: {
        ...options.display,
        name: options?.display?.name ? options.display.name : info?.title,
      },
      info,
      meta,
      data,
    },
    usedColors,
  );
  return ob;
}

export function fromBruker(result, options = {}, usedColors = {}) {
  const { dependentVariables, meta, source } = result;
  let data = dependentVariables[0].components;
  const datum2D = initiateDatum2D(
    {
      ...options,
      source,
      meta,
      data,
    },
    usedColors,
  );

  return datum2D;
}

// TODO: implement this.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fromCSD(result, options = {}, usedColors = {}) {
  const datum2D = initiateDatum2D({}, usedColors);
  return datum2D;
}

import { initiateDatum2D } from './Datum2D';

export function fromParsedJcamp(parsedJcamp, options = {}) {
  const { dependentVariables, info, meta } = parsedJcamp;
  let data = dependentVariables[0].components;
  const ob = initiateDatum2D({
    ...options,
    info,
    meta,
    data,
  });
  return ob;
}

export function fromBruker(result, options = {}) {
  const { dependentVariables, meta } = result;
  let data = dependentVariables[0].components;
  const datum2D = initiateDatum2D({
    ...options,
    meta,
    data,
  });

  return datum2D;
}

// eslint-disable-next-line no-unused-vars
export function fromCSD(result, options = {}) {
  const datum2D = initiateDatum2D({});
  return datum2D;
}

import { initiateDatum1D } from './Spectrum1D';

export function fromBruker(result, options = {}, usedColors = {}) {
  const { dependentVariables, info, meta, source } = result;

  let { data } = dependentVariables[0].components[0];

  const { x, re, im } = data;
  if (x[0] > x[1]) {
    x.reverse();
    re.reverse();
    if (im) im.reverse();
  }

  if (data.im) info.isComplex = true;

  if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];

  const datum1D = initiateDatum1D(
    {
      ...options,
      source,
      info,
      meta,
      data,
    },
    usedColors,
  );

  return datum1D;
}

export function fromCSD(result, options = {}, usedColors = {}) {
  let dimension = result.dimensions[0];
  let dependentVariables = result.dependentVariables;

  let quantityName = dimension.quantityName;
  let n = dimension.count;
  let incr = dimension.increment.magnitude;
  let origin = dimension.originOffset.magnitude;
  let offset = dimension.coordinatesOffset.magnitude;

  let buffer = dependentVariables[0].components[0];
  let re: number[] = [];
  let im: number[] = [];
  for (let i = buffer.length - 1; i > 0; i -= 2) {
    re.push(buffer[i - 1]);
    im.push(buffer[i]);
  }

  let data: any = {};
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

  let scale: number[] = [];
  for (let x = 0; x < n; x++) {
    scale.push(x0 + x * i);
  }

  data.x = scale;

  const datum1D = initiateDatum1D(
    {
      ...options,
      data,
    },
    usedColors,
  );
  return datum1D;
}

export function fromParsedJcamp(
  parsedJcamp,
  options,
  usedColors,
  jcampSpectrumIndex: number,
) {
  const { dependentVariables, info, meta } = parsedJcamp;
  let data = getData(dependentVariables[0].components);
  if (Array.isArray(info.nucleus)) info.nucleus = info.nucleus[0];
  const datum1D = initiateDatum1D(
    {
      ...options,
      source: { ...options.source, jcampSpectrumIndex },
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

  return datum1D;
}

function getData(spectra) {
  let x = spectra[0]?.data?.x ? spectra[0].data.x : [];
  let re = spectra[0]?.data?.y ? spectra[0].data.y : [];
  let im = spectra[1]?.data?.y ? spectra[1].data.y : null;

  if (x[0] > x[1]) {
    x.reverse();
    re.reverse();
    if (im) im.reverse();
  }
  return { x, re, im };
}

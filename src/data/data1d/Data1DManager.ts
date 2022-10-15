import { initiateDatum1D } from './Spectrum1D';

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

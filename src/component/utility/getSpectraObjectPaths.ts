import { Spectrum } from 'nmr-load-save';

export function getSpectraObjectPaths(
  spectra: Spectrum[],
  keys: Array<keyof Spectrum> = ['display', 'meta', 'info', 'customInfo'],
) {
  const paths = {};

  for (const spectrum of spectra) {
    for (const key of keys) {
      lookForObjectsPaths(spectrum[key], [key], paths);
    }
  }

  return { datalist: Object.keys(paths), paths };
}

function lookForObjectsPaths(
  obj: any,
  path: string[],
  output: Record<string, string[]>,
) {
  if (['string', 'number', 'boolean'].includes(typeof obj)) {
    const key = path.join('.');
    output[key] = path;
    path = [];
  } else {
    for (const key in obj) {
      lookForObjectsPaths(obj[key], [...path.slice(), key], output);
    }
  }
}

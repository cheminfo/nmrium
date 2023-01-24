import { Datum1D } from '../../data/types/data1d/Datum1D';
import { Datum2D } from '../../data/types/data2d/Datum2D';

export function getSpectraObjectPaths(spectra: (Datum1D | Datum2D)[]) {
  const keys = ['display', 'meta', 'info', 'metaInfo'];

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
    for (let key in obj) {
      lookForObjectsPaths(obj[key], [...path.slice(), key], output);
    }
  }
}

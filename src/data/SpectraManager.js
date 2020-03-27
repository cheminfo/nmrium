import { convertFolder as convertBruker } from 'brukerconverter';
import { convert, createTree } from 'jcampconverter';

import { Data1DManager } from './data1d/Data1DManager';
import { Datum1D } from './data1d/Datum1D';
import { Data2DManager } from './data2d/Data2DManager';
import { getInfoFromMetaData } from './utilities/getInfoFromMetaData';

export function addJcampFromURL(spectra, jcampURL, options) {
  return fetch(jcampURL)
    .then((response) => response.text())
    .then((jcamp) => {
      addJcamp(spectra, jcamp, options);
    });
}

export function addJcamp(spectra, jcamp, options = {}) {
  // need to parse the jcamp

  let tree = createTree(jcamp);
  if (tree.length === 0) return;
  // Should be improved when we have a more complex case
  let current = tree[0];
  if (current.jcamp) {
    addJcampSS(spectra, current.jcamp, options);
  }
  if (current.children) {
    for (let child of current.children) {
      if (child.jcamp) {
        addJcampSS(spectra, child.jcamp, options);
      }
    }
  }
}

export async function fromJSON(spectra, data = []) {
  let promises = [];
  for (let datum of data) {
    if (datum.source.jcamp != null) {
      addJcamp(spectra, datum.source.jcamp, datum);
    } else if (datum.source.jcampURL != null) {
      promises.push(addJcampFromURL(spectra, datum.source.jcampURL, datum));
    } else {
      spectra.push(new Datum1D({ ...datum, data: datum.source.original }));
    }
  }
  await Promise.all(promises);
}

function addJcampSS(spectra, jcamp, options) {
  let result = convert(jcamp, { withoutXY: true, keepRecordsRegExp: /.*/ });
  let info = getInfoFromMetaData(result.info);
  if (info.dimension === 1) {
    spectra.push(Data1DManager.fromJcamp(jcamp, options));
  }
  if (info.dimension === 2) {
    spectra.push(Data2DManager.fromJcamp(jcamp, options));
  }
}

export function addBruker(spectra, color, data) {
  const { acqus, procs, content } = data;
  let result = convertBruker({ acqus, procs, '1r': content }, { xy: true });

  let info = getInfoFromMetaData(result.info);

  spectra.push(Data1DManager.fromBruker(result, color, info));
}

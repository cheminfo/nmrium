import { convert, createTree } from 'jcampconverter';
import { Data1DManager } from './data1d/Data1DManager';
import { getInfoFromMetaData } from './utilities/getInfoFromMetaData';

export async function addJcampFromURL(spectra, id, jcampURL, options) {
  let jcamp = await fetch(jcampURL).then((response) => response.text());
  addJcamp(spectra, id, jcamp, options);
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

function addJcampSS(spectra, jcamp, options) {
  let result = convert(jcamp, { withoutXY: true, keepRecordsRegExp: /.*/ });
  let meta = getInfoFromMetaData(result.info);
  if (meta.dimension === 1) {
    spectra.push(Data1DManager.fromJcamp(jcamp, options));
  }
  // if (meta.dimension === 2) {
  //   this.spectra.push(Data2DManager.fromJcamp(jcamp, options));
  // }
}

import Jszip from 'jszip';

const jszip = new Jszip();
export async function addSource(nmrRecord, options = {}) {
  const { spectrum, source } = options;
  const { file = {}, jcampURL } = source;
  let tag = '';
  const dimension = `${spectrum.info.dimension}d`;
  switch (file.extension) {
    case 'jdx':
    case 'dx':
      tag += `\nJcamp_Location=file:jcamp/${dimension}/${spectrum.display.name}\\`;
      nmrRecord.file(
        `jcamp/${dimension}/${spectrum.display.name}`,
        file.binary,
      );
      break;
    case 'zip':
      if (!file.binary) return;
      void jszip.loadAsync(file.binary).then(async (zip) => {
        for (const file in zip.files) {
          if (file.endsWith('/')) continue;
          nmrRecord.file(
            `Bruker/${file}`,
            await zip.file(file).async('arraybuffer'),
          );
        }
        tag += `\nSpectrum_Location=file:Bruker/${getPathFromZip(zip)}\\`;
      });
      break;
    default:
      if (!jcampURL) break;
      void (await fetch(jcampURL).then(async (jcamp) => {
        if (!jcamp) return;
        let name = jcampURL.split('/').slice(-1);
        const path = `jcamp/${dimension}/${name}`;
        tag += `\nJcamp_Location=file:${path}\\`;
        nmrRecord.file(path, await jcamp.arrayBuffer());
      }));
  }

  return tag;
}

function getPathFromZip(zip) {
  let files = zip.filter(function (relativePath) {
    if (relativePath.match('__MACOSX')) return false;
    if (
      relativePath.endsWith('fid') ||
      relativePath.endsWith('1r') ||
      relativePath.endsWith('ser') ||
      relativePath.endsWith('2rr')
    ) {
      return true;
    }
    return false;
  });
  const index = files.findIndex(
    (file) => file.name.endsWith('1r') || file.name.endsWith('2rr'),
  );
  return index > -1 ? files[index].name : files[0].name;
}

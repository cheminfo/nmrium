import Jszip from 'jszip';
import { NmrRecord, parseSDF } from 'nmredata';

import { addBruker, addJcamps } from '../../data/SpectraManager';

import { addRanges } from './util/nmredata/addRanges';
import { addZones } from './util/nmredata/addZones';

export async function nmredataToNmrium(file, usedColors) {
  const jszip = new Jszip();
  const zip = await jszip.loadAsync(file.binary);
  const sdfFiles = await getSDF(zip.files);
  const jsonData = await NmrRecord.toJSON({
    sdf: sdfFiles[0],
    zipFiles: zip.files,
  });

  let { spectra, molecules = [] } = jsonData;

  let nmrium: { spectra: any[]; molecules: any[] } = {
    spectra: [],
    molecules,
  };

  for (const data of spectra) {
    const { file, jcampURL } = data.source;

    let spectrum = (await getSpectra(file, { jcampURL }, usedColors)) || [];

    for (const spectrumData of spectrum) {
      const { info } = spectrumData;

      if (info.isFid) continue;

      if (info.dimension > 1) {
        addZones(data.signals, spectrumData);
      } else {
        addRanges(data.signals, spectrumData);
      }
    }

    nmrium.spectra.push(...spectrum);
  }

  return nmrium;
}

interface GetSpectraOptions {
  xy?: boolean;
  noContours?: boolean;
  keepOriginal?: boolean;
  jcampURL?: string;
}

async function getSpectra(
  file,
  options: GetSpectraOptions = {},
  usedColors = {},
) {
  const {
    xy = true,
    noContours = true,
    keepOriginal = true,
    jcampURL,
  } = options;
  switch (file.extension) {
    case 'jdx':
    case 'dx':
      return addJcamps([file], usedColors);
    case 'zip':
      return addBruker(
        { xy, noContours, keepOriginal },
        file.binary,
        usedColors,
      );
    default:
      if (!jcampURL) {
        new Error('file extension is not supported');
        return;
      }
  }
}

async function getSDF(zipFiles) {
  let result: any[] = [];
  for (const file in zipFiles) {
    const pathFile = file.split('/');
    if (/^[^.].+sdf$/.exec(pathFile[pathFile.length - 1])) {
      const filename = pathFile[pathFile.length - 1].replace(/\.sdf/, '');
      const root = pathFile.slice(0, pathFile.length - 1).join('/');
      const sdf = await zipFiles[file].async('string');
      let parserResult = parseSDF(`${sdf}`, { mixedEOL: true });
      parserResult.filename = filename;
      parserResult.root = root !== '' ? `${root}/` : '';
      result.push(parserResult);
    }
  }
  return result;
}

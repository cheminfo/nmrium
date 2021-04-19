import { NmrRecord, parseSDF } from 'nmredata';

import { addBruker, addJcamp } from '../../data/SpectraManager';
import { detectRanges, mapRanges } from '../../data/data1d/Datum1D';
import { detectZones } from '../../data/data2d/Datum2D';

export async function nmredataToNmrium(zipFilesValues) {
  let files = {};
  for (let file of zipFilesValues) files[file.name] = file;
  let sdfFiles = await getSDF(files);
  let jsonData = await NmrRecord.toJSON({
    sdf: sdfFiles[0],
    zipFiles: files,
  });
  let nmrium = {
    spectra: [],
    molecules: [],
  };

  let { spectra, molecules } = jsonData;
  for (let data of spectra) {
    let { zip, jcamp } = data.source;
    let spectrum;
    if (zip) {
      spectrum = await addBruker(
        { xy: true, noContours: true, base64: true },
        zip,
      );
    } else {
      spectrum = addJcamp({}, jcamp);
    }

    let { info } = spectrum[0];
    if (info.dimension > 1) {
      // detectZones(spectrum[0], {});
    } else {
      detectRanges(spectrum[0], {});
      let ranges = assignRanges(spectrum[0], data.signals);
      spectrum[0].ranges.values = ranges;
    }
    nmrium.spectra.push(...spectrum);
  }

  nmrium.molecules = molecules;

  return nmrium;
}

async function getSDF(zipFiles) {
  let result = [];
  for (let file in zipFiles) {
    let pathFile = file.split('/');
    if (pathFile[pathFile.length - 1].match(/^[^.].+sdf$/)) {
      let filename = pathFile[pathFile.length - 1].replace(/\.sdf/, '');
      let root = pathFile.slice(0, pathFile.length - 1).join('/');
      let sdf = await zipFiles[file].async('string');
      let parserResult = parseSDF(`${sdf}`, { mixedEOL: true });
      parserResult.filename = filename;
      parserResult.root = root !== '' ? `${root}/` : '';
      result.push(parserResult);
    }
  }
  return result;
}

function assignRanges(datum, signals) {
  let ranges = datum.ranges.values.slice();
  ranges.sort((a, b) => a.from - b.from);
  signals.sort((a, b) => a.delta - b.delta);
  for (let range of ranges) {
    let { from, to } = range;
    let signalsInside = [];
    for (let signal of signals) {
      if (signal.delta >= from && signal.delta <= to) {
        let { jCoupling: j, delta, diaID = [], multiplicity } = signal;
        signalsInside.push({ j, delta, diaID, multiplicity });
      }
      if (signal.delta > to) break;
    }
    if (signalsInside.length > 0) range.signal = signalsInside;
  }
  datum.ranges.values = [];
  return mapRanges(ranges, datum);
}

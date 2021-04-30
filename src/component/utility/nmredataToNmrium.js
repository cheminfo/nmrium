import { NmrRecord, parseSDF } from 'nmredata';

import { addBruker, addJcamps } from '../../data/SpectraManager';
import { detectRanges, mapRanges } from '../../data/data1d/Datum1D';
import { detectZones } from '../../data/data2d/Datum2D';

const computeDistance = (s1, s2) =>
  ['x', 'y'].reduce(
    (dist, axis) => Math.pow(s2[axis].delta - s1[axis].delta, 2) + dist,
    0,
  );

export async function nmredataToNmrium(files) {
  const sdfFiles = await getSDF(files);
  const jsonData = await NmrRecord.toJSON({
    sdf: sdfFiles[0],
    zipFiles: files,
  });
  let { spectra, molecules = [] } = jsonData;

  let nmrium = {
    spectra: [],
    molecules,
  };

  for (const data of spectra) {
    const { file, jcampURL } = data.source;

    let spectrum = await getSpectra(file, { jcampURL });

    for (let i = 0; i < spectrum.length; i++) {
      const { info } = spectrum[i];

      if (info.isFid) continue;

      if (info.dimension > 1) {
        detectZones(spectrum[i], {});
        assignZones(spectrum[i], data.signals);
      } else {
        detectRanges(spectrum[i], {});
        assignRanges(spectrum[i], data.signals);
      }
    }
    nmrium.spectra.push(...spectrum);
  }

  return nmrium;
}

async function getSpectra(file, options = {}) {
  const {
    xy = true,
    noContours = true,
    keepOriginal = true,
    jcampURL,
  } = options;
  switch (file.extension) {
    case 'jdx':
    case 'dx':
      return addJcamps([file]);
    case 'zip':
      return addBruker({ xy, noContours, keepOriginal }, file.binary);
    default:
      if (!jcampURL) {
        new Error('file extension is not supported');
        return;
      }
  }
}

async function getSDF(zipFiles) {
  let result = [];
  for (const file in zipFiles) {
    const pathFile = file.split('/');
    if (pathFile[pathFile.length - 1].match(/^[^.].+sdf$/)) {
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

function assignZones(datum, eSignals) {
  let zones = datum.zones.values;
  let signals = eSignals.slice();
  for (let zone of zones) {
    let signalsInside = [];
    for (let i = 0; i < signals.length; i++) {
      let isInside = 0;
      let signal = signals[i];
      for (let axis of ['x', 'y']) {
        let { from, to } = zone[axis];
        let deltaIn = signal[axis].delta;
        if (deltaIn >= from && deltaIn <= to) isInside++;
      }
      if (isInside > 1) {
        signalsInside.push(signal);
        signals.splice(i, 1);
        i--;
      }
    }
    if (signalsInside.length > 0) {
      for (let signal of signalsInside) {
        for (let axis of ['x', 'y']) {
          if (!signal[axis].diaID) continue;
          let index = closeSignalIndex(signal, zone);
          zone.signal[index][axis].diaID = signal[axis].diaID;
        }
      }
    }
  }
}

function closeSignalIndex(signal, zone) {
  const signals = zone.signal;
  if (signals.length === 1) return 0;

  let index = 0;
  let distance = computeDistance(signals[0], signal);
  for (let i = 0; i < signals.length; i++) {
    let currentDistance = computeDistance(signals[i], signal);
    if (currentDistance < distance) {
      index = i;
      distance = currentDistance;
    }
  }
  return index;
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
  datum.ranges.values = mapRanges(ranges, datum);
}

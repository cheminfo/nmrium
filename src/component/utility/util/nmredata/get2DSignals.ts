import { addSource } from './addSource';
import { getCouplingObserved } from './getCouplingObserved';
import { getToFix } from './getToFix';

const isArray = Array.isArray;

interface Get2DSignalsOptions {
  labels: { byDiaID?: string };
  prefix?: string;
}

export async function get2DSignals(
  data,
  nmrRecord,
  options: Get2DSignalsOptions = { labels: {} },
) {
  const { byDiaID } = options.labels;
  let str = '';
  let nucleusRecorded: Array<Array<any>> = [];
  const prefix = `\n> <NMREDATA_2D_`;
  for (let spectrum of data) {
    if (spectrum.info.dimension < 2) continue;
    let partTag = '';
    const { info, source } = spectrum;
    let { nucleus, experiment, pulseSequence } = info;

    nucleusRecorded.push(nucleus);

    let couplingObserved = getCouplingObserved(experiment);
    if (nucleus) {
      partTag += `${prefix}${nucleus[1]}_${couplingObserved}_${nucleus[0]}>`;
    }
    let toFix = getToFix(nucleus);

    partTag += await addSource(nmrRecord, {
      spectrum,
      source,
    });

    if (experiment) partTag += `\nCorType=${experiment} \\`;
    if (pulseSequence) partTag += `\nPulseProgram=${pulseSequence} \\`;

    if (spectrum.info.baseFrequency) {
      partTag += `\nLarmor=${Number(spectrum.info.baseFrequency[0]).toFixed(
        2,
      )}\\`;
    }

    let zones = spectrum.zones.values || [];
    for (let zone of zones) {
      let signals = zone.signals;
      for (let signal of signals) {
        let { x, y, peaks } = signal;
        let xLabel = getAssignment(x, byDiaID, toFix[0]);
        let yLabel = getAssignment(y, byDiaID, toFix[1]);
        let intensity = Math.max(...peaks.map((e) => e.z));
        partTag += `\n${xLabel}/${yLabel}, I=${intensity.toFixed(2)}\\`;
      }
    }
    str += partTag;
  }
  return str.length > 0 ? `${str}\n` : '';
}

function getAssignment(axis, labels, toFix) {
  let { diaIDs, delta } = axis;
  if (diaIDs) {
    if (!isArray(diaIDs)) diaIDs = [diaIDs];
    if (diaIDs.length < 1) return Number(delta).toFixed(toFix);
    let label = diaIDs.map((diaID) => labels[diaID].label).join(',');
    return diaIDs.length > 1 ? `(${label})` : label;
  }
  return Number(delta).toFixed(toFix);
}

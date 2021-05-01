import { addSource } from './addSource';
import { getCouplingObserved } from './getCouplingObserved';
import { getToFix } from './getToFix';

const isArray = Array.isArray;

export async function get2DSignals(data, nmrRecord, options = {}) {
  let { prefix, labels } = options;
  let { byDiaID } = labels;
  let str = '';
  let nucleusRecorded = [];
  for (let spectrum of data) {
    if (spectrum.info.dimension < 2) continue;
    let partTag = '';
    const { info, source } = spectrum;
    let { nucleus, experiment, pulseSequence } = info;

    if (experiment) prefix = `\n> 2D ${experiment} <NMREDATA_2D_`;

    nucleusRecorded.push(nucleus);

    let couplingObserved = getCouplingObserved(experiment);
    if (nucleus) {
      partTag += `${prefix}${nucleus[1]}_${couplingObserved}_${nucleus[0]}>`;
    }
    let toFix = getToFix(nucleus);

    partTag += await addSource(nmrRecord, {
      spectrum,
      tag: partTag,
      source,
    });

    if (experiment) partTag += `\nCorType=${experiment} \\`;
    if (pulseSequence) partTag += `\nPulseProgram=${pulseSequence} \\`;

    let zones = spectrum.zones.values || [];
    for (let zone of zones) {
      let signals = zone.signal;
      for (let signal of signals) {
        let { x, y, peak } = signal;
        let xLabel = getAssignment(x, byDiaID, toFix[0]);
        let yLabel = getAssignment(y, byDiaID, toFix[1]);
        let intensity = Math.max(...peak.map((e) => e.z));
        partTag += `\n${xLabel}/${yLabel}, I=${intensity.toFixed(2)}\\`;
      }
    }
    str += partTag;
  }
  return str;
}

function getAssignment(axis, labels, toFix) {
  let { diaID, delta } = axis;
  if (diaID) {
    if (!isArray(diaID)) diaID = [diaID];
    if (diaID.length < 1) return Number(delta).toFixed(toFix);
    let label = diaID.map((diaID) => labels[diaID].label).join(',');
    return diaID.length > 1 ? `(${label})` : label;
  }
  return Number(delta).toFixed(toFix);
}

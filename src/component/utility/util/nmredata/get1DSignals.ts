import { addSource } from './addSource';
import { getToFix } from './getToFix';

interface Get1DSignalsOptions {
  prefix?: string;
  labels: {
    byDiaID: Array<{ label: string }>;
  };
}

export async function get1DSignals(
  data,
  nmrRecord,
  options: Get1DSignalsOptions = { labels: { byDiaID: [] } },
) {
  let { prefix = '', labels } = options;
  let str = '';
  let nucleusArray: Array<Array<any>> = [];
  for (let spectrum of data) {
    const { info } = spectrum;
    if (info.isFid || info.dimension > 1) continue;
    let partTag = '';
    let ranges = spectrum.ranges.values || [];

    let nucleus = spectrum.info.nucleus;
    let counter = 1;
    let subfix = '';
    nucleusArray.forEach((e) => {
      if (e === nucleus) counter++;
    });
    nucleusArray.push(nucleus);

    if (counter > 1) subfix = `#${counter}`;

    partTag += `${prefix}1D_${nucleus.toUpperCase()}${subfix}>`;

    if (spectrum.info.baseFrequency) {
      partTag += `\nLarmor=${Number(spectrum.info.baseFrequency).toFixed(2)}\\`;
    }

    const { source = {} } = spectrum;

    partTag += await addSource(nmrRecord, {
      spectrum,
      source,
    });

    let toFix = getToFix(nucleus)[0];

    for (let range of ranges) {
      let signals = range.signal;

      for (let signal of signals) {
        let { multiplicity } = signal;
        if ((!multiplicity || multiplicity === 'm') && nucleus === '1H') {
          partTag += `\n${Number(range.from).toFixed(toFix)}-${Number(
            range.to,
          ).toFixed(toFix)}`;
        } else if (signal.delta) {
          partTag += `\n${Number(signal.delta).toFixed(toFix)}`;
        } else {
          continue;
        }

        let signalLabel = '';

        if (signal.diaID && signal.diaID.length > 0) {
          signal.diaID.forEach((diaID, i, arr) => {
            let separator = ', ';
            if (i === arr.length - 1) separator = '';
            let label = labels.byDiaID[diaID].label || diaID;
            signalLabel += `${label}${separator}`;
          });
          partTag += `, L=${signalLabel}`;
        }

        if (nucleus === '1H') {
          if (signal.multiplicity) partTag += `, S=${signal.multiplicity}`;

          let jCoupling = signal.j;
          if (Array.isArray(jCoupling) && jCoupling.length) {
            let separator = ', J=';

            for (const jCouplingElement of jCoupling) {
              partTag += `${separator}${Number(
                jCouplingElement.coupling,
              ).toFixed(3)}`;
              if (jCouplingElement.diaID) {
                let { diaID } = jCouplingElement;
                if (!Array.isArray(diaID)) diaID = [diaID];
                if (!diaID.length) continue;
                let jCouple =
                  labels.byDiaID[diaID[0]].label || String(diaID[0]);
                partTag += `(${jCouple})`;
              }
              separator = ', ';
            }
          }
          if (range.integral) {
            partTag += `, E=${Number(range.integral).toFixed(toFix)}`;
          } else if (range.pubIntegral) {
            partTag += `, E=${range.putIntegral.toFixed(toFix)}`;
          } else if (range.signal[0].nbAtoms !== undefined) {
            partTag += `, E=${range.signal[0].nbAtoms}`;
          }
        }
      }
      if (signals.length) partTag += '\\';
    }
    partTag += '\n';

    if (/\n/.exec(partTag)) str += partTag;
  }
  return str;
}

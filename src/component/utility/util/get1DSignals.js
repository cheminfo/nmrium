import { getToFix } from './getToFix';

export function get1DSignals(data, labels, options = {}) {
  const { prefix, nmrRecord } = options;
  let str = '';
  let nucleusArray = [];
  for (let spectrum of data) {
    if (spectrum.info.dimension > 1) continue;

    let ranges = spectrum.ranges.values || [];

    let nucleus = spectrum.info.nucleus;
    let counter = 1;
    let subfix = '';
    nucleusArray.forEach((e) => {
      if (e === nucleus) counter++;
    });
    nucleusArray.push(nucleus);

    if (counter > 1) subfix = `#${counter}`;

    str += `${prefix}1D_${nucleus.toUpperCase()}#${subfix}>`;

    if (spectrum.info.frequency) {
      str += `\nLarmor=${Number(spectrum.info.frequency).toFixed(2)}\\`;
    }

    if (spectrum.source.jcamp) {
      nmrRecord.file(
        `jcamp_folder/1d/${spectrum.display.name}`,
        spectrum.source.jcamp,
      );
      str += `\nSpectrum_Jcamp=file:./jcamp_folder/1d/${spectrum.display.name}\\`;
    }

    let toFix = getToFix(nucleus)[0];

    for (let range of ranges) {
      let signals = range.signal; //.filter((s) => s.diaID && s.diaID.length);

      for (let signal of signals) {
        let { multiplicity } = signal;
        if ((!multiplicity || multiplicity === 'm') && nucleus === '1H') {
          str += `\n${Number(range.from).toFixed(toFix)}-${Number(
            range.to,
          ).toFixed(toFix)}`;
        } else if (signal.delta) {
          str += `\n${Number(signal.delta).toFixed(toFix)}`;
        } else {
          continue;
        }

        let signalLabel = '';

        if (signal.diaID && signal.diaID.length > 0) {
          signal.diaID.forEach((diaID, i, arr) => {
            let separator = ', ';
            if (i === arr.length - 1) separator = '';
            let label = labels.byDiaID[diaID].label || diaID;
            signalLabel += `(${label})${separator}`;
          });
          str += `, L=${signalLabel}`;
        }

        if (nucleus === '1H') {
          if (signal.multiplicity) str += `, S=${signal.multiplicity}`;

          let jCoupling = signal.j;
          if (Array.isArray(jCoupling) && jCoupling.length) {
            let separator = ', J=';
            for (let i = 0; i < jCoupling.length; i++) {
              str += `${separator}${Number(jCoupling[i].coupling).toFixed(3)}`;
              if (jCoupling[i].diaID) {
                let { diaID } = jCoupling[i];
                if (!Array.isArray(diaID)) diaID = [diaID];
                if (!diaID.length) continue;
                let jCouple = labels[diaID[0]].label || String(diaID[0]);
                str += `(${jCouple})`;
              }
              separator = ', ';
            }
          }
          if (range.integral) {
            str += `, E=${Number(range.integral).toFixed(toFix)}`;
          } else if (range.pubIntegral) {
            str += `, E=${range.putIntegral.toFixed(toFix)}`;
          } else if (range.signal[0].nbAtoms !== undefined) {
            str += `, E=${range.signal[0].nbAtoms}`;
          }
        }
      }
      if (signals.length) str += '\\';
    }
    str += '\n';
  }

  return str;
}

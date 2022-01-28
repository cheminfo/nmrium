import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

export default function detectSignal(x, re, from, to, frequency) {
  const { fromIndex, toIndex } = xGetFromToIndex(x, {
    from: from,
    to: to,
  });
  const data = {
    x: x.slice(fromIndex, toIndex),
    y: re.slice(fromIndex, toIndex),
  };

  const result = analyseMultiplet(data, {
    frequency: frequency,
    takeBestPartMultiplet: true,
    symmetrizeEachStep: true,
  });
  if (result && result.chemShift === undefined) return;
  return {
    multiplicity: result.js.map((j) => j.multiplicity).join(''),
    kind: 'signal',
    delta: result.chemShift,
    js: result.js,
  };
}

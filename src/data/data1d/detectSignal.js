import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

const detectSignal = (x, re, from, to, frequency) => {
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

  return {
    nbAtoms: 0,
    diaD: [],
    multiplicity: result.j.map((j) => j.multiplicity).join(''),
    kind: '',
    remark: '',
    peak: [], // @TODO receive peaks from result in future?
    delta: result.chemShift,
    j: result.j,
    from: from,
    to: to,
  };
};

export default detectSignal;

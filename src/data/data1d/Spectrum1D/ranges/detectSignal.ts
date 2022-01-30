import { xGetFromToIndex } from 'ml-spectra-processing';
import { analyseMultiplet } from 'multiplet-analysis';

const MAX_LENGTH = 2048;

export default function detectSignal(
  x: Float64Array,
  re: Float64Array,
  from,
  to,
  frequency,
) {
  const { fromIndex, toIndex } = xGetFromToIndex(x, {
    from: from,
    to: to,
  });
  if (toIndex - fromIndex < MAX_LENGTH) {
    const data = {
      x: x.subarray(fromIndex, toIndex),
      y: re.subarray(fromIndex, toIndex),
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
  } else {
    console.log('Too big');
    // we should display here a message like in
    // https://github.com/cheminfo/nmrium/blob/1c01a78e1249ad7fe2955f454264162b0ef4dc0f/src/component/panels/SpectrumsPanel/SpectraPanelHeader.tsx#L110-L113
    // Message is: 'Advanced peak picking only available for area up to ${} points'
  }
}

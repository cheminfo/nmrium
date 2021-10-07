import { Draft } from 'immer';

import { generateSpectrumFromRanges } from '../../../data/data1d/Spectrum1D';
import { State } from '../Reducer';

import { setDomain } from './DomainActions';
import { setZoom } from './Zoom';

function handleRangeResurrecting(draft: Draft<State>, action) {
  const {
    payload: { ranges, info },
    usedColors,
  } = action;

  const datum = generateSpectrumFromRanges(ranges, info, usedColors['1d']);
  draft.data.push(datum);
  setDomain(draft);
  setZoom(draft, { scale: 0.8 });
}

export { handleRangeResurrecting };

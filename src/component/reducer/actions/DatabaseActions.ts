import { Draft } from 'immer';

import { generateSpectrumFromRanges } from '../../../data/data1d/Spectrum1D';
import { State } from '../Reducer';

import { setDomain } from './DomainActions';
import { setZoom } from './Zoom';

function handleRangeResurrecting(draft: Draft<State>, action) {
  const { ranges, info } = action.payload;

  const datum = generateSpectrumFromRanges(ranges, info, draft.usedColors);
  draft.data.push(datum);
  setDomain(draft, { yDomain: { isShared: false } });
  setZoom(draft, { scale: 0.8, spectrumID: datum.id });
}

export { handleRangeResurrecting };

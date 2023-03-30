import { Draft } from 'immer';

import { get1DColor, mapRanges } from '../../../data/data1d/Spectrum1D';
import { generateSpectrumFromRanges } from '../../../data/data1d/Spectrum1D/ranges/generateSpectrumFromRanges';
import { State } from '../Reducer';
import { setZoom } from '../helper/Zoom1DManager';

import { setDomain, setIntegralsYDomain } from './DomainActions';

function handleResurrectSpectrumFromJcamp(draft: Draft<State>, action) {
  let { ranges, spectrum } = action.payload;
  spectrum = {
    ...spectrum,
    ranges: { ...spectrum.ranges, values: mapRanges(ranges, spectrum) },
    display: {
      ...spectrum.display,
      ...get1DColor(spectrum.display, draft.usedColors),
    },
  };

  draft.data.push(spectrum);
  setDomain(draft);
  setIntegralsYDomain(draft, [spectrum]);
  setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });
}

function handleResurrectSpectrumFromRanges(draft: Draft<State>, action) {
  const { ranges, info } = action.payload;

  const datum = generateSpectrumFromRanges(ranges, info, draft.usedColors);
  draft.data.push(datum);
  setDomain(draft, { isYDomainShared: false });
  setIntegralsYDomain(draft, [datum]);
  setZoom(draft, { scale: 0.8, spectrumID: datum.id });
}

export { handleResurrectSpectrumFromRanges, handleResurrectSpectrumFromJcamp };

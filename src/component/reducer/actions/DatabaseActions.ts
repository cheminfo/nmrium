import { Draft } from 'immer';

import { addJcamp } from '../../../data/SpectraManager';
import { mapRanges } from '../../../data/data1d/Spectrum1D';
import { generateSpectrumFromRanges } from '../../../data/data1d/Spectrum1D/ranges/generateSpectrumFromRanges';
import { Datum1D } from '../../../data/types/data1d';
import { State } from '../Reducer';
import { setZoom } from '../helper/Zoom1DManager';

import { setDomain, setIntegralsYDomain } from './DomainActions';

function handleResurrectSpectrumFromJcamp(draft: Draft<State>, action) {
  const { ranges, file, jcampURL } = action.payload;
  let spectra: Datum1D[] = [];
  addJcamp(
    spectra,
    file,
    {
      source: {
        jcampURL,
      },
    },
    draft.usedColors,
  );
  const spectrum = spectra[0];

  spectrum.ranges.values = mapRanges(ranges, spectrum);
  draft.data.push(spectrum);
  setDomain(draft);
  setIntegralsYDomain(draft, [spectrum]);
  setZoom(draft, { scale: 0.8, spectrumID: spectrum.id });
}

function handleResurrectSpectrumFromRanges(draft: Draft<State>, action) {
  const { ranges, info } = action.payload;

  const datum = generateSpectrumFromRanges(ranges, info, draft.usedColors);
  draft.data.push(datum);
  setDomain(draft, { yDomain: { isShared: false } });
  setIntegralsYDomain(draft, [datum]);
  setZoom(draft, { scale: 0.8, spectrumID: datum.id });
}

export { handleResurrectSpectrumFromRanges, handleResurrectSpectrumFromJcamp };

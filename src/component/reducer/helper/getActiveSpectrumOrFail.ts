import { Draft } from 'immer';

import { assert } from '../../utility/assert';
import { State } from '../Reducer';

export function getActiveSpectrumOrFail(draft: Draft<State>) {
  const activeSpectrum =
    draft.view.spectra.activeSpectra[draft.view.spectra.activeTab];

  assert(activeSpectrum !== null, 'Active spectrum must have id');
  return activeSpectrum;
}

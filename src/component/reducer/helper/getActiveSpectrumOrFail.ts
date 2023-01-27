import { Draft } from 'immer';

import { assert } from '../../utility/assert';
import { State } from '../Reducer';

export function getActiveSpectrumOrFail(draft: Draft<State>) {
  const { activeSpectra, activeTab } = draft.view.spectra;

  const activeSpectrum = activeSpectra[activeTab]?.[0];

  assert(activeSpectrum !== null, 'Active spectrum must have id');
  return activeSpectrum;
}

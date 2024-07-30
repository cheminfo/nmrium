import { Draft } from 'immer';

import { removeByPaths } from '../../../data/utilities/removeByPaths';
import { State } from '../Reducer';

export function removeSpectrumRelatedObjectsById(
  data: Draft<State> | Partial<State>,
  spectrumKey: string,
) {
  const nucleus = data.view?.spectra.activeTab;
  removeByPaths(
    data,
    [
      ['view.ranges', null],
      ['view.zones', null],
      ['view.peaks', null],
      ['view.integrals', null],
      ['view.zoom.levels', null],
      [`view.spectra.activeSpectra.${nucleus}`, 'id'],
      ['xDomains', null],
      ['yDomains', null],
      ['originDomain.xDomains', null],
      ['originDomain.yDomains', null],
    ],
    spectrumKey,
  );
}

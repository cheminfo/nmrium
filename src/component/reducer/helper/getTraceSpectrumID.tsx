import type { Draft } from 'immer';

import type { Layout } from '../../2d/utilities/DimensionLayout.ts';
import { LAYOUT } from '../../2d/utilities/DimensionLayout.ts';
import type { State } from '../Reducer.ts';

//utility
export function getTraceSpectrumID(
  draft: Draft<State>,
  trackID: Layout | undefined,
): string | null {
  const index = trackID === LAYOUT.top ? 0 : trackID === LAYOUT.left ? 1 : null;

  if (index === null) return null;

  const { activeSpectra, activeTab } = draft.view.spectra;

  const spectra = activeSpectra[activeTab.split(',')[index]];

  if (spectra?.length === 1) {
    return spectra[0].id;
  }

  return null;
}

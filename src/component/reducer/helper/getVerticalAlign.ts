import type { Draft } from 'immer';

import type { State, VerticalAlignment } from '../Reducer.js';

export function getVerticalAlign(
  state: State | Draft<State>,
  defaultAlign: VerticalAlignment = 'bottom',
): VerticalAlignment {
  const {
    view: {
      verticalAlign,
      spectra: { activeTab },
    },
  } = state;

  return verticalAlign?.[activeTab] || defaultAlign;
}

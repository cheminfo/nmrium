import { Draft } from 'immer';

import { State } from '../Reducer';

function setWidth(draft: Draft<State>, width) {
  draft.width = width;
}

function handleSetDimensions(draft: Draft<State>, action) {
  const { width, height } = action.payload;
  draft.width = width;
  draft.height = height;
}

export { setWidth, handleSetDimensions };

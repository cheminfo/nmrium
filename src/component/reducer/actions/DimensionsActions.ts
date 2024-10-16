import { Draft } from 'immer';

import { State } from '../Reducer.js';
import { ActionType } from '../types/ActionType.js';

type SetDimensionsAction = ActionType<
  'SET_DIMENSIONS',
  { width: number; height: number }
>;

export type DimensionsActions = SetDimensionsAction;

function handleSetDimensions(draft: Draft<State>, action: SetDimensionsAction) {
  const { width, height } = action.payload;
  draft.width = width;
  draft.height = height;
}

export { handleSetDimensions };

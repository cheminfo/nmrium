import { Draft } from 'immer';

import { State } from '../Reducer';
import { ActionType } from '../types/ActionType';

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

import { Draft } from 'immer';

import { State } from '../Reducer';
import { ActionType } from '../types/Types';

type SetIsOverDisplayerAction = ActionType<
  'SET_MOUSE_OVER_DISPLAYER',
  {
    isMouseOverDisplayer: boolean;
  }
>;

export type GlobalActions = SetIsOverDisplayerAction;

function handleSetIsOverDisplayer(
  draft: Draft<State>,
  action: SetIsOverDisplayerAction,
) {
  draft.overDisplayer = action.payload.isMouseOverDisplayer;
}
export { handleSetIsOverDisplayer };

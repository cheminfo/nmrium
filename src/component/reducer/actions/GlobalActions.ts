import { Draft } from 'immer';

import { State } from '../Reducer';

function setIsOverDisplayer(draft: Draft<State>, actions) {
  draft.overDisplayer = actions.payload;
}
export { setIsOverDisplayer };

import { produce } from 'immer';

export const initState = {
  helpText: null,
  helpObject: null,
};
function innerHelpReducer(draft, action) {
  switch (action.type) {
    case 'SHOW': {
      if (draft.data[action.id]) {
        draft.helpText = draft.data[action.id].text;
      }
      break;
    }
    case 'HIDE': {
      draft.helpText = null;
      break;
    }
    default: {
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

export default produce(innerHelpReducer);

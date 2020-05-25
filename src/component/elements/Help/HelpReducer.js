export const initState = {
  helpText: null,
  helpObject: null,
  // highlighted: [],
};
let timeout = null;
export function helpReducer(state, action) {
  switch (action.type) {
    case 'SHOW': {
      const helpText = state.data[action.id].text;
      return { ...state, helpText };
    }
    case 'SHOW_MODAL': {
      const imageURL = state.data[action.id].imageURL;
      return { ...state, helpObject: { imageURL } };
    }
    case 'HIDE': {
      if (timeout) {
        clearTimeout(timeout);
      }
      return { ...state, helpText: null };
    }
    default: {
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

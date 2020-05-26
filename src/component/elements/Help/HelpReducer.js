export const initState = {
  helpText: null,
  helpObject: null,
  // highlighted: [],
};
export function helpReducer(state, action) {
  switch (action.type) {
    case 'SHOW': {
      const helpText = state.data[action.id].text;
      return { ...state, helpText };
    }
    case 'HIDE': {
      return { ...state, helpText: null };
    }
    default: {
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

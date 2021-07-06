import { produce } from 'immer';

import { getXScale, getYScale } from '../1d/utilities/scale';

export const SET_X_SCALE = 'SET_X_SCALE';
export const SET_Y_SCALE = 'SET_Y_SCALE';
export const SET_SCALE = 'SET_SCALE';

export const scaleInitialState = {
  scaleX: null,
  scaleY: null,
};

function innerScaleReducer(draft, action) {
  switch (action.type) {
    case SET_X_SCALE:
      draft.scaleX = (spectrumId = null) => getXScale(action, spectrumId);
      break;

    case SET_Y_SCALE:
      draft.scaleY = (spectrumId = null) => getYScale(action, spectrumId);
      break;

    case SET_SCALE: {
      draft.scaleX = (spectrumId = null) =>
        getXScale(action.payload, spectrumId);
      draft.scaleY = (spectrumId = null) =>
        getYScale(action.payload, spectrumId);
      break;
    }
    default:
      return draft;
  }
}

const scaleReducer = produce(innerScaleReducer);
export default scaleReducer;

import { ScaleLinear } from 'd3';
import { produce } from 'immer';

import { getXScale, getYScale } from '../1d/utilities/scale';

export const SET_X_SCALE = 'SET_X_SCALE';
export const SET_Y_SCALE = 'SET_Y_SCALE';
export const SET_SCALE = 'SET_SCALE';

type ScaleLinearNumberFunction = (
  spectrumId?: number | null | string,
) => ScaleLinear<number, number, number>;

export interface ScaleState {
  scaleX: ScaleLinearNumberFunction | null;
  scaleY: ScaleLinearNumberFunction | null;
  shiftY: number;
}

export const scaleInitialState: ScaleState = {
  scaleX: null,
  scaleY: null,
  shiftY: 0,
};

function innerScaleReducer(draft: ScaleState, action) {
  switch (action.type) {
    case SET_X_SCALE:
      draft.scaleX = (spectrumId = null) => getXScale(action, spectrumId);
      break;

    case SET_Y_SCALE:
      draft.scaleY = (spectrumId = null) => getYScale(action, spectrumId);
      break;

    case SET_SCALE: {
      const { yDomains, verticalAlign, height } = action.payload;

      if (verticalAlign === 'stack') {
        draft.shiftY = height / (Object.keys(yDomains).length + 2);
      } else {
        draft.shiftY = 0;
      }

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

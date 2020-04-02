import { produce } from 'immer';

import Spectrum2D from './core/Spectrum2D';

export const contoursInitialState = {
  contours: [],
};

function initiate2D(state, action) {
  return produce(state, (draft) => {
    const { tabActiveSpectrum, activeTab, data } = action;
    if (tabActiveSpectrum[activeTab]) {
      const index = tabActiveSpectrum[activeTab].index;
      const spectrum2D = new Spectrum2D(data[index]);
      draft.contours = spectrum2D.drawContours();
    }
  });
}

const levelChangeHandler = (state, { deltaY, shiftKey }) => {
  try {
    const spectrum2D = Spectrum2D.getInstance();
    if (shiftKey) {
      spectrum2D.shiftWheel(deltaY);
    } else {
      spectrum2D.wheel(deltaY);
    }

    const contours = spectrum2D.drawContours();
    return { ...state, contours };
  } catch (e) {
    return state;
  }
};

export function contoursReducer(state, action) {
  switch (action.type) {
    case 'initiate':
      return initiate2D(state, action);
    case 'SET_2D_LEVEL':
      return levelChangeHandler(state, action);
    default:
      return state;
  }
}

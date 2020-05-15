import { extent } from 'd3';
import { produce } from 'immer';
import { xyIntegral } from 'ml-spectra-processing';

import { Datum2D } from '../../../data/data2d/Datum2D';
import { getXScale } from '../../1d/utilities/scale';
import { get2DXScale, get2DYScale } from '../../2d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

// import { getScale } from './ScaleActions';
import { setIntegralZoom, integralZoomHanlder } from './Zoom';

const handleChangeIntegralSum = (state, value) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeIntegralSum(value);
      draft.data[index].integrals = datumObject.getIntegrals();
      if (!state.data.integralsYDomain) {
        draft.integralsYDomains[id] = draft.yDomains[id];
      }
    }
  });
};

const handleChangeIntegralZoom = (state, action) => {
  return produce(state, (draft) => {
    const { deltaY, deltaMode } = action;
    integralZoomHanlder.wheel(deltaY, deltaMode);
    setIntegralZoom(state, integralZoomHanlder.getScale(), draft);
  });
};

const addIntegral = (state, action) => {
  const scaleX = getXScale(null, state);

  return produce(state, (draft) => {
    const start = scaleX.invert(action.startX);
    const end = scaleX.invert(action.endX);

    let integralRange = [];
    if (start > end) {
      integralRange = [end, start];
    } else {
      integralRange = [start, end];
    }

    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.addIntegral(integralRange);
      draft.data[index].integrals = datumObject.getIntegrals();
      const values = draft.data[index].integrals.values;
      if (values.length === 1) {
        const { from, to } = values[0];
        const { x, y } = draft.data[index];
        const integralResult = xyIntegral(
          { x: x, y: y },
          {
            from: from,
            to: to,
            reverse: true,
          },
        );
        const integralYDomain = extent(integralResult.y);
        draft.integralsYDomains[id] = integralYDomain;
        draft.originIntegralYDomain = integralYDomain;
        setIntegralZoom(state, draft.integralZoomFactor.scale, draft);
      }
    }
  });
};

const deleteIntegral = (state, action) => {
  return produce(state, (draft) => {
    const { integralID } = action;
    const { id, index } = state.activeSpectrum;
    const object = AnalysisObj.getDatum(id);
    object.deleteIntegral(integralID);
    draft.data[index].integrals = object.getIntegrals();
  });
};

const changeIntegral = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.setIntegral(action.data);
      draft.data[index].integrals = datumObject.getIntegrals();
    }
  });
};

const handleResizeIntegral = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeIntegral(action.data);
      draft.data[index].integrals = datumObject.getIntegrals();
    }
  });
};

const add2dIntegralHandler = (state, action) => {
  return produce(state, (draft) => {
    const { startX, startY, endX, endY } = action;
    // const { width, height, margin, xDomain, yDomain } = state;
    const scaleX = get2DXScale(state);
    const scaleY = get2DYScale(state);
    const x1 = startX * 1000000 > endX * 1000000 ? endX : startX;
    const x2 = startX * 1000000 > endX * 1000000 ? startX : endX;
    const y1 = startY * 1000000 > endY * 1000000 ? endY : startY;
    const y2 = startY * 1000000 > endY * 1000000 ? startY : endY;

    const datumObject =
      state.activeSpectrum && state.activeSpectrum.id
        ? AnalysisObj.getDatum(state.activeSpectrum.id)
        : null;
    if (datumObject && datumObject instanceof Datum2D) {
      datumObject.addIntegral({
        x1: scaleX.invert(x1),
        x2: scaleX.invert(x2),
        y1: scaleY.invert(y1),
        y2: scaleY.invert(y2),
      });

      const integrals = datumObject.getIntegrals();
      draft.data[state.activeSpectrum.index].integrals = integrals;
    }
  });
};
// eslint-disable-next-line no-unused-vars
const delete2dIntegralHandler = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum && state.activeSpectrum.id) {
      const datumObject = AnalysisObj.getDatum(state.activeSpectrum.id);
      datumObject.deleteIntegral(action.id);
      const integrals = datumObject.getIntegrals();
      draft.data[state.activeSpectrum.index].integrals = integrals;
    }
  });
};

export {
  handleChangeIntegralSum,
  handleChangeIntegralZoom,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
  add2dIntegralHandler,
  delete2dIntegralHandler,
};

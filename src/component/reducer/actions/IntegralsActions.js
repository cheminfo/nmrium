import { extent } from 'd3';
import { produce } from 'immer';
import { xyIntegral } from 'ml-spectra-processing';

import { getXScale } from '../../1d/utilities/scale';
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
  const scaleX = getXScale(state);

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
        draft.originIntegralYDomain[id] = integralYDomain;
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

export {
  handleChangeIntegralSum,
  handleChangeIntegralZoom,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
};

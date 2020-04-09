import { extent } from 'd3';
import { produce } from 'immer';
import { XY } from 'ml-spectra-processing';

import { AnalysisObj } from '../core/Analysis';

import { getScale } from './ScaleActions';
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
  const scale = getScale(state).x;

  return produce(state, (draft) => {
    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);

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
        const integralResult = XY.integral(
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

const handleResizeIntegral = (state, integralData) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeIntegral(integralData);
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

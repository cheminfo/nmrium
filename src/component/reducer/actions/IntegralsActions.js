import { produce } from 'immer';
import { extent, scaleLinear, zoomIdentity } from 'd3';
import { XY } from 'ml-spectra-processing';

import { AnalysisObj } from '../core/Analysis';
import Spectrum1DZoomHelper from '../helper/Spectrum1DZoomHelper';

import { getScale } from './ScaleActions';

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

const setIntegralZoom = (state, scale, draft) => {
  if (draft.activeSpectrum) {
    const { height, margin } = state;
    if (draft.originIntegralYDomain) {
      const _scale = scaleLinear(draft.originIntegralYDomain, [
        height - margin.bottom,
        margin.top,
      ]);

      const scaleValue = scale < 0.1 ? 0.05 : scale;
      const t = zoomIdentity
        .translate(0, height - margin.bottom)
        .scale(scaleValue)
        .translate(0, -(height - margin.bottom));

      const newYDomain = t.rescaleY(_scale).domain();

      draft.integralZoomFactor = { scale };
      const activeSpectrum = draft.activeSpectrum;
      // draft.zoomFactor = t;
      draft.integralsYDomains[activeSpectrum.id] = newYDomain;
    }
  }
};
const integralZoomHanlder = new Spectrum1DZoomHelper();

const handleChangeIntegralZoom = (state, action) => {
  return produce(state, (draft) => {
    const { deltaY, deltaMode } = action;
    integralZoomHanlder.wheel(deltaY, deltaMode);
    setIntegralZoom(state, integralZoomHanlder.getScale(draft.scale), draft);
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
        setIntegralZoom(state, draft.integralZoomFactor, draft);
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
  setIntegralZoom,
  handleChangeIntegralZoom,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
};

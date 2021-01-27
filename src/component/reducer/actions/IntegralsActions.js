import { extent } from 'd3';
import { xyIntegral } from 'ml-spectra-processing';

import { getXScale } from '../../1d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

import { setIntegralZoom, integralZoomHanlder } from './Zoom';

function handleChangeIntegralSum(draft, value) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.changeIntegralSum(value);
    draft.data[index].integrals = datumObject.getIntegrals();
    if (!draft.data.integralsYDomain) {
      draft.integralsYDomains[id] = draft.yDomains[id];
    }
  }
}

function handleChangeIntegralZoom(draft, action) {
  const { deltaY, deltaMode } = action;
  integralZoomHanlder.wheel(deltaY, deltaMode);
  setIntegralZoom(integralZoomHanlder.getScale(), draft);
}

function addIntegral(draft, action) {
  const scaleX = getXScale(draft);

  const start = scaleX.invert(action.startX);
  const end = scaleX.invert(action.endX);

  let integralRange = [];
  if (start > end) {
    integralRange = [end, start];
  } else {
    integralRange = [start, end];
  }

  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.addIntegral(integralRange);
    const integrals = datumObject.getIntegrals();
    draft.data[index].integrals = integrals;
    if (integrals.values.length === 1) {
      const { from, to } = integrals.values[0];
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
      setIntegralZoom(draft.integralZoomFactor.scale, draft);
    }
  }
}

function deleteIntegral(draft, action) {
  const { integralID } = action;
  const { id, index } = draft.activeSpectrum;
  const object = AnalysisObj.getDatum(id);
  object.deleteIntegral(integralID);
  draft.data[index].integrals = object.getIntegrals();
}

function changeIntegral(draft, action) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.setIntegral(action.data);
    draft.data[index].integrals = datumObject.getIntegrals();
  }
}

function handleResizeIntegral(draft, action) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = AnalysisObj.getDatum(id);
    datumObject.changeIntegral(action.data);
    draft.data[index].integrals = datumObject.getIntegrals();
  }
}

function handleChangeIntegralsRaltiveValue(draft, action) {
  const { id: integralID, value } = action;
  const { id, index } = draft.activeSpectrum;
  const datumObject = AnalysisObj.getDatum(id);
  datumObject.changeIntegralsRealtive(integralID, value);
  const integrals = datumObject.getIntegrals();

  draft.data[index].integrals = integrals;
}

export {
  handleChangeIntegralSum,
  handleChangeIntegralZoom,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleResizeIntegral,
  handleChangeIntegralsRaltiveValue,
};

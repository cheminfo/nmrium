import { extent } from 'd3';
import { original } from 'immer';
import { xyIntegral } from 'ml-spectra-processing';

import {
  getIntegration,
  updateIntegralIntegrals,
  changeIntegralsRealtive,
} from '../../../data/data1d/Datum1D';
import generateID from '../../../data/utilities/generateID';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

import { setIntegralZoom, integralZoomHanlder } from './Zoom';

function handleChangeIntegralSum(draft: State, value) {
  if (draft.activeSpectrum?.id) {
    const { index, id } = draft.activeSpectrum;
    draft.data[index].integrals.options.sum = value;
    updateIntegralIntegrals(draft.data[index].integrals);

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

function addIntegral(draft: State, action) {
  const state = original(draft);
  const { startX, endX } = action;
  const [from, to] = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id && state) {
    const { id, index } = draft.activeSpectrum;

    const integral = {
      id: generateID(),
      from,
      to,
      absolute: getIntegration(state.data[index].data, { from, to }), // the real value
      kind: 'signal',
    };

    draft.data[index].integrals.values.push(integral);
    updateIntegralIntegrals(draft.data[index].integrals);
    if (draft.data[index].integrals.values.length === 1) {
      const { from, to } = draft.data[index].integrals.values[0];
      const { x, y } = draft.data[index].data;
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
  const state = original(draft);
  const { index } = draft.activeSpectrum;
  const { integralID } = action;

  if (integralID == null) {
    draft.data[index].integrals.values = [];
  } else {
    const peakIndex = state.data[index].integrals.values.findIndex(
      (p) => p.id === integralID,
    );
    draft.data[index].integrals.values.splice(peakIndex, 1);
    updateIntegralIntegrals(draft.data[index].integrals);
  }
}

function changeIntegral(draft, action) {
  const state = original(draft);
  const integral = action.data;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const integralIndex = state.data[index].integrals.values.findIndex(
      (i) => i.id === integral.id,
    );
    if (integralIndex !== -1) {
      draft.data[index].integrals.values[integralIndex] = {
        // ...draft.data[index].integrals.values[integralIndex],
        ...integral,
        absolute: getIntegration(state.data[index].data, {
          from: integral.from,
          to: integral.to,
        }),
      };
      updateIntegralIntegrals(draft.data[index].integrals);
    }
  }
}

function handleChangeIntegralsRaltiveValue(draft, action) {
  const { id, value } = action;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeIntegralsRealtive(draft.data[index].integrals, id, value);
  }
}

export {
  handleChangeIntegralSum,
  handleChangeIntegralZoom,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleChangeIntegralsRaltiveValue,
};

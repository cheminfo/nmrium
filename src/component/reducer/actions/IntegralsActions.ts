import { extent } from 'd3';
import { Draft, original } from 'immer';
import { xyIntegral, xyIntegration } from 'ml-spectra-processing';

import {
  updateIntegralIntegrals,
  changeIntegralsRealtive,
  Datum1D,
} from '../../../data/data1d/Datum1D';
import generateID from '../../../data/utilities/generateID';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

import { setIntegralZoom, integralZoomHanlder } from './Zoom';

function handleChangeIntegralSum(draft: Draft<State>, value) {
  if (draft.activeSpectrum?.id) {
    const { index, id } = draft.activeSpectrum;
    (draft.data[index] as Datum1D).integrals.options.sum = value;
    updateIntegralIntegrals((draft.data[index] as Datum1D).integrals);

    if (!draft.integralsYDomains) {
      draft.integralsYDomains[id] = draft.yDomains[id];
    }
  }
}

function handleChangeIntegralZoom(draft: Draft<State>, action) {
  const { deltaY, deltaMode } = action;
  integralZoomHanlder.wheel(deltaY, deltaMode);
  setIntegralZoom(integralZoomHanlder.getScale(), draft);
}

function addIntegral(draft: Draft<State>, action) {
  const state = original(draft);
  const { startX, endX } = action;
  const [from, to] = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id && state) {
    const { id, index } = draft.activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const { x, re } = datum.data;
    const integral = {
      id: generateID(),
      from,
      to,
      absolute: xyIntegration({ x, y: re }, { from, to, reverse: true }), // the real value
      kind: 'signal',
    };
    datum.integrals.values.push(integral);
    updateIntegralIntegrals(datum.integrals);
    if (datum.integrals.values.length === 1) {
      const { from, to } = datum.integrals.values[0];
      const { x, y } = datum.data;
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

function deleteIntegral(draft: Draft<State>, action) {
  const state = original(draft) as State;
  const { index } = draft.activeSpectrum;
  const { integralID } = action;

  const datum = draft.data[index] as Datum1D;

  if (integralID == null) {
    datum.integrals.values = [];
  } else {
    const peakIndex = (state.data[index] as Datum1D).integrals.values.findIndex(
      (p) => p.id === integralID,
    );
    datum.integrals.values.splice(peakIndex, 1);
    updateIntegralIntegrals(datum.integrals);
  }
}

function changeIntegral(draft: Draft<State>, action) {
  const state = original(draft) as State;
  const integral = action.data;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const orignalDatum = state.data[index] as Datum1D;
    const datum = draft.data[index] as Datum1D;

    const { x, re } = orignalDatum.data;
    const integralIndex = orignalDatum.integrals.values.findIndex(
      (i) => i.id === integral.id,
    );
    if (integralIndex !== -1) {
      datum.integrals.values[integralIndex] = {
        // ...draft.data[index].integrals.values[integralIndex],
        ...integral,
        absolute: xyIntegration(
          { x, y: re },
          { from: integral.from, to: integral.to, reverse: true },
        ),
      };
      updateIntegralIntegrals(datum.integrals);
    }
  }
}

function handleChangeIntegralsRaltiveValue(draft: Draft<State>, action) {
  const { id, value } = action;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeIntegralsRealtive(
      (draft.data[index] as Datum1D).integrals,
      id,
      value,
    );
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

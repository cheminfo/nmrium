import { Draft, original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';

import {
  updateIntegralIntegrals,
  changeIntegralsRealtive,
  Datum1D,
  getShiftX,
} from '../../../data/data1d/Spectrum1D';
import generateID from '../../../data/utilities/generateID';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

function handleChangeIntegralSum(draft: Draft<State>, value) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    (draft.data[index] as Datum1D).integrals.options.sum = value;
    updateIntegralIntegrals(draft.data[index] as Datum1D, true);
  }
}

function addIntegral(draft: Draft<State>, action) {
  const state = original(draft);
  const { startX, endX } = action;
  const [from, to] = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id && state) {
    const { index } = draft.activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const { x, re } = datum.data;

    const shiftX = getShiftX(datum);

    const integral = {
      id: generateID(),
      originFrom: from - shiftX,
      originTo: to - shiftX,
      from,
      to,
      absolute: xyIntegration({ x, y: re }, { from, to, reverse: true }), // the real value
      kind: 'signal',
    };
    datum.integrals.values.push(integral);
    updateIntegralIntegrals(datum);
  }
}

function deleteIntegral(draft: Draft<State>, action) {
  if (draft.activeSpectrum) {
    const state = original(draft) as State;
    const { index } = draft.activeSpectrum;
    const { integralID } = action;

    const datum = draft.data[index] as Datum1D;

    if (integralID == null) {
      datum.integrals.values = [];
    } else {
      const peakIndex = (
        state.data[index] as Datum1D
      ).integrals.values.findIndex((p) => p.id === integralID);
      datum.integrals.values.splice(peakIndex, 1);
      updateIntegralIntegrals(datum);
    }
  }
}

function changeIntegral(draft: Draft<State>, action) {
  const state = original(draft) as State;
  const integral = action.payload.data;

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
        originFrom: integral.from,
        originTo: integral.to,
        ...integral,
        absolute: xyIntegration(
          { x, y: re },
          { from: integral.from, to: integral.to, reverse: true },
        ),
      };
      updateIntegralIntegrals(datum);
    }
  }
}

function handleChangeIntegralsRaltiveValue(draft: Draft<State>, action) {
  const data = action.payload.data;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeIntegralsRealtive(draft.data[index] as Datum1D, data);
  }
}

function handleChangeIntegralsSumFlag(draft, action) {
  const flag = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    draft.data[index].integrals.options.isSumConstant = !flag;
  }
}

export {
  handleChangeIntegralSum,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleChangeIntegralsRaltiveValue,
  handleChangeIntegralsSumFlag,
};

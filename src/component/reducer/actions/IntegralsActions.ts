import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';

import {
  updateIntegralsRelativeValues,
  changeIntegralsRelative,
  getShiftX,
} from '../../../data/data1d/Spectrum1D';
import {
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';

import { setIntegralsYDomain } from './DomainActions';

function handleChangeIntegralSum(draft: Draft<State>, action) {
  const { options } = action.payload;
  const {
    data,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Spectrum1D;
    setSumOptions(datum.integrals, { options, nucleus });
    updateIntegralsRelativeValues(datum, true);
  }
}

function addIntegral(draft: Draft<State>, action) {
  const { startX, endX } = action.payload;
  const {
    data,
    molecules,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  const [from, to] = getRange(draft, { startX, endX });

  if (activeSpectrum?.id) {
    const datum = data[activeSpectrum.index] as Spectrum1D;

    const { x, re } = datum.data;

    const shiftX = getShiftX(datum);

    const integral = {
      id: v4(),
      originFrom: from - shiftX,
      originTo: to - shiftX,
      from,
      to,
      absolute: xyIntegration({ x, y: re }, { from, to, reverse: true }), // the real value
      kind: 'signal',
    };
    datum.integrals.values.push(integral);
    datum.integrals.options = initSumOptions(datum.integrals.options, {
      molecules,
      nucleus,
    });
    updateIntegralsRelativeValues(datum);
    setIntegralsYDomain(draft, datum);
  }
}

function deleteIntegral(draft: Draft<State>, action) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const state = original(draft) as State;
    const { index } = activeSpectrum;
    const { integralID } = action.payload;

    const datum = draft.data[index] as Spectrum1D;

    if (integralID == null) {
      datum.integrals.values = [];
    } else {
      const peakIndex = (
        state.data[index] as Spectrum1D
      ).integrals.values.findIndex((p) => p.id === integralID);
      datum.integrals.values.splice(peakIndex, 1);
      updateIntegralsRelativeValues(datum);
    }
  }
}

function changeIntegral(draft: Draft<State>, action) {
  const activeSpectrum = getActiveSpectrum(draft);
  const state = original(draft) as State;
  const integral = action.payload.data;

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;

    const originalDatum = state.data[index] as Spectrum1D;
    const datum = draft.data[index] as Spectrum1D;

    const { x, re } = originalDatum.data;
    const integralIndex = originalDatum.integrals.values.findIndex(
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
      updateIntegralsRelativeValues(datum);
    }
  }
}

function handleChangeIntegralsRelativeValue(draft: Draft<State>, action) {
  const activeSpectrum = getActiveSpectrum(draft);
  const data = action.payload.data;
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    changeIntegralsRelative(draft.data[index] as Spectrum1D, data);
  }
}

function handleChangeIntegralsSumFlag(draft, action) {
  const flag = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    draft.data[index].integrals.options.isSumConstant = !flag;
  }
}

export {
  handleChangeIntegralSum,
  addIntegral,
  deleteIntegral,
  changeIntegral,
  handleChangeIntegralsRelativeValue,
  handleChangeIntegralsSumFlag,
};

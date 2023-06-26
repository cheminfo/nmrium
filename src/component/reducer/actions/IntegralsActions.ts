import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Integral } from 'nmr-processing';

import {
  updateIntegralsRelativeValues,
  changeIntegralsRelative,
  getShiftX,
} from '../../../data/data1d/Spectrum1D';
import {
  SetSumOptions,
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { ActionType } from '../types/ActionType';

import { setIntegralsYDomain } from './DomainActions';

type ChangeIntegralSumAction = ActionType<
  'CHANGE_INTEGRAL_SUM',
  { options: SetSumOptions }
>;
type AddIntegralAction = ActionType<
  'ADD_INTEGRAL',
  { startX: number; endX: number }
>;
type DeleteIntegralAction = ActionType<'DELETE_INTEGRAL', { id?: string }>;
type ChangeIntegralAction = ActionType<
  'CHANGE_INTEGRAL' | 'RESIZE_INTEGRAL',
  { integral: Integral }
>;
type ChangeIntegralRelativeValueAction = ActionType<
  'CHANGE_INTEGRAL_RELATIVE',
  { id: string; value: number }
>;

export type IntegralsActions =
  | ChangeIntegralSumAction
  | AddIntegralAction
  | DeleteIntegralAction
  | ChangeIntegralAction
  | ChangeIntegralRelativeValueAction
  | ActionType<'CHANGE_INTEGRALS_SUM_FLAG'>;

function handleChangeIntegralSum(
  draft: Draft<State>,
  action: ChangeIntegralSumAction,
) {
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

function handleAddIntegral(draft: Draft<State>, action: AddIntegralAction) {
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
    const integration = xyIntegration(
      { x, y: re },
      { from, to, reverse: true },
    );
    const integral = {
      id: v4(),
      originFrom: from - shiftX,
      originTo: to - shiftX,
      from,
      to,
      integral: integration,
      absolute: integration,
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

function handleDeleteIntegral(
  draft: Draft<State>,
  action: DeleteIntegralAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const state = original(draft) as State;
    const { index } = activeSpectrum;
    const { id: integralID } = action?.payload || {};

    const datum = draft.data[index] as Spectrum1D;

    if (!integralID) {
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

function handleChangeIntegral(
  draft: Draft<State>,
  action: ChangeIntegralAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  const state = original(draft) as State;
  const { integral } = action.payload;

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
        ...integral,
        originFrom: integral.from,
        originTo: integral.to,
        absolute: xyIntegration(
          { x, y: re },
          { from: integral.from, to: integral.to, reverse: true },
        ),
      };
      updateIntegralsRelativeValues(datum);
    }
  }
}

function handleChangeIntegralsRelativeValue(
  draft: Draft<State>,
  action: ChangeIntegralRelativeValueAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);
  const { id, value } = action.payload;
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    changeIntegralsRelative(draft.data[index] as Spectrum1D, { id, value });
  }
}

function handleChangeIntegralsSumFlag(draft) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum) {
    const { index } = activeSpectrum;
    const integralOptions = draft.data[index].integrals.options;
    integralOptions.isSumConstant = !integralOptions.isSumConstant;
  }
}

export {
  handleChangeIntegralSum,
  handleAddIntegral,
  handleDeleteIntegral,
  handleChangeIntegral,
  handleChangeIntegralsRelativeValue,
  handleChangeIntegralsSumFlag,
};

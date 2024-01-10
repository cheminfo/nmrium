import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';
import { IntegralsViewState, Spectrum1D } from 'nmr-load-save';
import { Integral } from 'nmr-processing';

import {
  updateIntegralsRelativeValues,
  changeIntegralsRelative,
  getShiftX,
} from '../../../data/data1d/Spectrum1D';
import {
  SetSumOptions,
  SumParams,
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { getSpectrum } from '../helper/getSpectrum';
import { ActionType } from '../types/ActionType';
import { setIntegralsViewProperty } from '../helper/setIntegralsViewProperty';
import { FilterType } from '../../utility/filterType';

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
type CutIntegralAction = ActionType<'CUT_INTEGRAL', { cutValue: number }>;

type ToggleIntegralsViewAction = ActionType<
  'TOGGLE_INTEGRALS_VIEW_PROPERTY',
  {
    key: keyof FilterType<IntegralsViewState, boolean>;
  }
>;

export type IntegralsActions =
  | ChangeIntegralSumAction
  | AddIntegralAction
  | DeleteIntegralAction
  | ChangeIntegralAction
  | ChangeIntegralRelativeValueAction
  | CutIntegralAction
  | ToggleIntegralsViewAction
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

interface AddIntegralOptions {
  from: number;
  to: number;
}

function initiateIntergalSumOptions(datum: Spectrum1D, options: SumParams) {
  const { molecules, nucleus } = options;
  datum.integrals.options = initSumOptions(datum.integrals.options, {
    molecules,
    nucleus,
  });
}

function addIntegral(datum: Spectrum1D, options: AddIntegralOptions) {
  const { from, to } = options;
  const { x, re } = datum.data;

  const shiftX = getShiftX(datum);
  const integration = xyIntegration({ x, y: re }, { from, to, reverse: true });
  const integral = {
    id: v4(),
    originalFrom: from - shiftX,
    originalTo: to - shiftX,
    from,
    to,
    integral: integration,
    absolute: integration,
    kind: 'signal',
  };
  datum.integrals.values.push(integral);
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
  if (activeSpectrum?.id) {
    const [from, to] = getRange(draft, { startX, endX });
    const datum = data[activeSpectrum.index] as Spectrum1D;
    addIntegral(datum, { from, to });
    initiateIntergalSumOptions(datum, { molecules, nucleus });
    updateIntegralsRelativeValues(datum);
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
        originalFrom: integral.from,
        originalTo: integral.to,
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

function handleCutIntegral(draft: Draft<State>, action: CutIntegralAction) {
  const { cutValue } = action.payload;
  const spectrum = getSpectrum(draft) as Spectrum1D;
  const integrals = spectrum.integrals.values;

  for (let i = 0; i < integrals.length; i++) {
    const { to, from } = integrals[i];
    if (cutValue > from && cutValue < to) {
      integrals.splice(i, 1);
      addIntegral(spectrum, { from, to: cutValue });
      addIntegral(spectrum, { from: cutValue, to });
    }
  }

  updateIntegralsRelativeValues(spectrum);
}

function toggleIntegralsViewProperty(
  draft: Draft<State>,
  key: keyof FilterType<IntegralsViewState, boolean>,
) {
  setIntegralsViewProperty(draft, key, (flag) => !flag);
}

//action
function handleToggleIntegralsViewProperty(
  draft: Draft<State>,
  action: ToggleIntegralsViewAction,
) {
  const { key } = action.payload;
  toggleIntegralsViewProperty(draft, key);
}

export {
  handleCutIntegral,
  handleChangeIntegralSum,
  handleAddIntegral,
  handleDeleteIntegral,
  handleChangeIntegral,
  handleChangeIntegralsRelativeValue,
  handleChangeIntegralsSumFlag,
  handleToggleIntegralsViewProperty,
};

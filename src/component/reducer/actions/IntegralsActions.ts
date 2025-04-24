import type { Draft } from 'immer';
import { original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';
import type { Integral } from 'nmr-processing';
import type { IntegralsViewState, Spectrum1D } from 'nmrium-core';

import type {
  SetSumOptions,
  SumParams,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  updateIntegralsRelativeValues,
  changeIntegralsRelative,
  getShiftX,
} from '../../../data/data1d/Spectrum1D/index.js';
import type { FilterType } from '../../utility/filterType.js';
import type { State } from '../Reducer.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import getRange from '../helper/getRange.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import { setIntegralsViewProperty } from '../helper/setIntegralsViewProperty.js';
import type { ActionType } from '../types/ActionType.js';

type ChangeIntegralSumAction = ActionType<
  'CHANGE_INTEGRAL_SUM',
  { options: SetSumOptions }
>;
type AddIntegralAction = ActionType<
  'ADD_INTEGRAL',
  { startX: number; endX: number }
>;
type DeleteIntegralAction = ActionType<
  'DELETE_INTEGRAL',
  { id?: string; spectrumKey?: string }
>;
type ChangeIntegralAction = ActionType<
  'CHANGE_INTEGRAL' | 'RESIZE_INTEGRAL',
  { integral: Integral; spectrumKey?: string }
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

function initiateIntegralSumOptions(datum: Spectrum1D, options: SumParams) {
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
  const integration = xyIntegration({ x, y: re }, { from, to });
  const integral = {
    id: crypto.randomUUID(),
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
    initiateIntegralSumOptions(datum, { molecules, nucleus });
    updateIntegralsRelativeValues(datum);
  }
}

function handleDeleteIntegral(
  draft: Draft<State>,
  action: DeleteIntegralAction,
) {
  const { id: integralID, spectrumKey } = action?.payload || {};
  const datum = getSpectrum(draft, spectrumKey);

  if (!datum) return;

  if (!integralID) {
    datum.integrals.values = [];
  } else {
    const peakIndex = datum.integrals.values.findIndex(
      (p) => p.id === integralID,
    );
    datum.integrals.values.splice(peakIndex, 1);
    updateIntegralsRelativeValues(datum);
  }
}

function handleChangeIntegral(
  draft: Draft<State>,
  action: ChangeIntegralAction,
) {
  const state = original(draft) as State;
  const { integral, spectrumKey } = action.payload;

  const originalDatum = getSpectrum(state, spectrumKey);
  const datum = getSpectrum(draft, spectrumKey);

  if (!datum) {
    return;
  }

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
        { from: integral.from, to: integral.to },
      ),
    };
    updateIntegralsRelativeValues(datum);
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

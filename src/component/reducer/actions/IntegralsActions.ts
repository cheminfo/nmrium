import type { Integral } from '@zakodium/nmr-types';
import type { IntegralsViewState, Spectrum1D } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { original } from 'immer';
import { xyIntegration } from 'ml-spectra-processing';

import type {
  SetSumOptions,
  SumParams,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  changeIntegralsRelative,
  getShiftX,
  isSpectrum1D,
  updateIntegralsRelativeValues,
} from '../../../data/data1d/Spectrum1D/index.js';
import type { FilterType } from '../../utility/filterType.js';
import type { State } from '../Reducer.js';
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

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  setSumOptions(spectrum.integrals, {
    options,
    nucleus: spectrum.info.nucleus,
  });
  updateIntegralsRelativeValues(spectrum, true);
}

interface AddIntegralOptions {
  from: number;
  to: number;
}

function initiateIntegralSumOptions(spectrum: Spectrum1D, options: SumParams) {
  const { molecules, nucleus } = options;
  spectrum.integrals.options = initSumOptions(spectrum.integrals.options, {
    molecules,
    nucleus,
  });
}

function addIntegral(spectrum: Spectrum1D, options: AddIntegralOptions) {
  const { from, to } = options;
  const { x, re } = spectrum.data;

  const shiftX = getShiftX(spectrum);
  const integration = xyIntegration({ x, y: re }, { from, to });
  const integral: Integral = {
    id: crypto.randomUUID(),
    originalFrom: from - shiftX,
    originalTo: to - shiftX,
    from,
    to,
    integral: integration,
    absolute: integration,
    kind: 'signal',
  };
  spectrum.integrals.values.push(integral);
}

function handleAddIntegral(draft: Draft<State>, action: AddIntegralAction) {
  const { startX, endX } = action.payload;
  const {
    molecules,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const spectrum = getSpectrum(draft);
  if (isSpectrum1D(spectrum)) {
    const [from, to] = getRange(draft, { startX, endX });
    addIntegral(spectrum, { from, to });
    initiateIntegralSumOptions(spectrum, { molecules, nucleus });
    updateIntegralsRelativeValues(spectrum);
  }
}

function handleDeleteIntegral(
  draft: Draft<State>,
  action: DeleteIntegralAction,
) {
  const { id: integralID, spectrumKey } = action?.payload || {};
  const spectrum = getSpectrum(draft, spectrumKey);

  if (!isSpectrum1D(spectrum)) return;

  if (!integralID) {
    spectrum.integrals.values = [];
  } else {
    const peakIndex = spectrum.integrals.values.findIndex(
      (p: any) => p.id === integralID,
    );
    spectrum.integrals.values.splice(peakIndex, 1);
    updateIntegralsRelativeValues(spectrum);
  }
}

function handleChangeIntegral(
  draft: Draft<State>,
  action: ChangeIntegralAction,
) {
  const { integral, spectrumKey } = action.payload;

  const spectrum = getSpectrum(draft, spectrumKey);
  if (!isSpectrum1D(spectrum)) return;

  const integralIndex = spectrum.integrals.values.findIndex(
    (i) => i.id === integral.id,
  );

  if (integralIndex !== -1) {
    const {
      data: { x, re },
    } = original(spectrum) as Spectrum1D;
    spectrum.integrals.values[integralIndex] = {
      ...integral,
      originalFrom: integral.from,
      originalTo: integral.to,
      absolute: xyIntegration(
        { x, y: re },
        { from: integral.from, to: integral.to },
      ),
    };
    updateIntegralsRelativeValues(spectrum);
  }
}

function handleChangeIntegralsRelativeValue(
  draft: Draft<State>,
  action: ChangeIntegralRelativeValueAction,
) {
  const { id, value } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  changeIntegralsRelative(spectrum, { id, value });
}

function handleChangeIntegralsSumFlag(draft: Draft<State>) {
  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const integralOptions = spectrum.integrals.options;
  integralOptions.isSumConstant = !integralOptions.isSumConstant;
}

function handleCutIntegral(draft: Draft<State>, action: CutIntegralAction) {
  const { cutValue } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

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
  handleAddIntegral,
  handleChangeIntegral,
  handleChangeIntegralSum,
  handleChangeIntegralsRelativeValue,
  handleChangeIntegralsSumFlag,
  handleCutIntegral,
  handleDeleteIntegral,
  handleToggleIntegralsViewProperty,
};

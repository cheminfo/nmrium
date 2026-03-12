import type { Nucleus1DUnit, Nucleus2DUnit } from '@zakodium/nmrium-core';
import {
  defaultAxisUnit1DFid,
  defaultAxisUnit1DFt,
} from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { match } from 'ts-pattern';

import type { State } from '../Reducer.ts';
import type { ActionType } from '../types/ActionType.ts';

interface SetAxisUnit1DHorizontalActionPayload<
  Mode extends keyof Nucleus1DUnit['horizontal'],
> {
  nucleus: string;
  mode: Mode;
  unit: Nucleus1DUnit['horizontal'][Mode];
}

interface SetAxisUnit2DDirectActionPayload<
  Mode extends keyof Nucleus2DUnit['direct'],
> {
  nucleus: string;
  mode: Mode;
  unit: Nucleus2DUnit['direct'][Mode];
}

interface SetAxisUnit2DIndirectActionPayload<
  Mode extends keyof Nucleus2DUnit['indirect'],
> {
  nucleus: string;
  mode: Mode;
  unit: Nucleus2DUnit['indirect'][Mode];
}

type SetAxisUnit1DHorizontalAction = ActionType<
  'SET_AXIS_UNIT_1D_HORIZONTAL',
  | SetAxisUnit1DHorizontalActionPayload<'fid'>
  | SetAxisUnit1DHorizontalActionPayload<'ft'>
>;

type SetAxisUnit2DDirectAction = ActionType<
  'SET_AXIS_UNIT_2D_DIRECT',
  | SetAxisUnit2DDirectActionPayload<'fid'>
  | SetAxisUnit2DDirectActionPayload<'ft'>
>;

type SetAxisUnit2DIndirectAction = ActionType<
  'SET_AXIS_UNIT_2D_INDIRECT',
  | SetAxisUnit2DIndirectActionPayload<'fid'>
  | SetAxisUnit2DIndirectActionPayload<'ft'>
>;

export type UnitActions =
  | SetAxisUnit1DHorizontalAction
  | SetAxisUnit2DDirectAction
  | SetAxisUnit2DIndirectAction;

const defaultUnit1DNucleus: Nucleus1DUnit = {
  horizontal: {
    fid: defaultAxisUnit1DFid,
    ft: defaultAxisUnit1DFt,
  },
};
export function handleSetAxisUnit1DHorizontalAction(
  draft: Draft<State>,
  action: SetAxisUnit1DHorizontalAction,
) {
  const { nucleus } = action.payload;

  const unitNucleus =
    draft.view.units1D[nucleus] ?? structuredClone(defaultUnit1DNucleus);

  match(action.payload)
    .with({ mode: 'fid' }, ({ mode, unit }) => {
      unitNucleus.horizontal[mode] = unit;
    })
    .with({ mode: 'ft' }, ({ mode, unit }) => {
      unitNucleus.horizontal[mode] = unit;
    })
    .exhaustive();

  draft.view.units1D[nucleus] = unitNucleus;
}

const defaultUnit2DNucleus: Nucleus2DUnit = {
  direct: {
    fid: 's',
    ft: 'ppm',
  },
  indirect: {
    fid: 's',
    ft: 'ppm',
  },
};
export function handleSetAxisUnit2DDirectAction(
  draft: Draft<State>,
  action: SetAxisUnit2DDirectAction,
) {
  const { nucleus } = action.payload;

  const unitNucleus =
    draft.view.units2D[nucleus] ?? structuredClone(defaultUnit2DNucleus);

  match(action.payload)
    .with({ mode: 'fid' }, ({ mode, unit }) => {
      unitNucleus.direct[mode] = unit;
    })
    .with({ mode: 'ft' }, ({ mode, unit }) => {
      unitNucleus.direct[mode] = unit;
    })
    .exhaustive();

  draft.view.units2D[nucleus] = unitNucleus;
}

export function handleSetAxisUnit2DIndirectAction(
  draft: Draft<State>,
  action: SetAxisUnit2DIndirectAction,
) {
  const { nucleus } = action.payload;

  const unitNucleus =
    draft.view.units2D[nucleus] ?? structuredClone(defaultUnit2DNucleus);

  match(action.payload)
    .with({ mode: 'fid' }, ({ mode, unit }) => {
      unitNucleus.indirect[mode] = unit;
    })
    .with({ mode: 'ft' }, ({ mode, unit }) => {
      unitNucleus.indirect[mode] = unit;
    })
    .exhaustive();

  draft.view.units2D[nucleus] = unitNucleus;
}

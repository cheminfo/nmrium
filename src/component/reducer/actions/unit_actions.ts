import type { Nucleus1DUnit, Nucleus2DUnit } from '@zakodium/nmrium-core';
import {
  defaultAxisUnit1DFid,
  defaultAxisUnit1DFt,
} from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { assertUnreachable } from 'react-science/ui';

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

  draft.view.units1D[nucleus] ??= defaultUnit1DNucleus;

  const mode = action.payload.mode;
  switch (mode) {
    case 'fid':
      draft.view.units1D[nucleus].horizontal.fid = action.payload.unit;
      break;
    case 'ft':
      draft.view.units1D[nucleus].horizontal.ft = action.payload.unit;
      break;
    default:
      assertUnreachable(mode);
  }
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

  draft.view.units2D[nucleus] ??= defaultUnit2DNucleus;

  const mode = action.payload.mode;
  switch (mode) {
    case 'fid':
      draft.view.units2D[nucleus].direct.fid = action.payload.unit;
      break;
    case 'ft':
      draft.view.units2D[nucleus].direct.ft = action.payload.unit;
      break;
    default:
      assertUnreachable(mode);
  }
}

export function handleSetAxisUnit2DIndirectAction(
  draft: Draft<State>,
  action: SetAxisUnit2DIndirectAction,
) {
  const { nucleus } = action.payload;

  draft.view.units2D[nucleus] ??= defaultUnit2DNucleus;

  const mode = action.payload.mode;
  switch (mode) {
    case 'fid':
      draft.view.units2D[nucleus].indirect.fid = action.payload.unit;
      break;
    case 'ft':
      draft.view.units2D[nucleus].indirect.ft = action.payload.unit;
      break;
    default:
      assertUnreachable(mode);
  }
}

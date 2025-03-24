import { createContext, useContext } from 'react';

import type { AssignmentsActions } from '../reducer/actions/AssignmentsActions.js';
import type { CorrelationsActions } from '../reducer/actions/CorrelationsActions.js';
import type { DatabaseActions } from '../reducer/actions/DatabaseActions.js';
import type { DimensionsActions } from '../reducer/actions/DimensionsActions.js';
import type { DomainActions } from '../reducer/actions/DomainActions.js';
import type { FiltersActions } from '../reducer/actions/FiltersActions.js';
import type { InsetsActions } from '../reducer/actions/InsetActions.js';
import type { IntegralsActions } from '../reducer/actions/IntegralsActions.js';
import type { LoadActions } from '../reducer/actions/LoadActions.js';
import type { MoleculeActions } from '../reducer/actions/MoleculeActions.js';
import type { PeaksActions } from '../reducer/actions/PeaksActions.js';
import type { PreferencesActions } from '../reducer/actions/PreferencesActions.js';
import type { RangesActions } from '../reducer/actions/RangesActions.js';
import type { SpectrumActions } from '../reducer/actions/SpectraActions.js';
import type { ToolsActions } from '../reducer/actions/ToolsActions.js';
import type { ZonesActions } from '../reducer/actions/ZonesActions.js';
import type { ActionType } from '../reducer/types/ActionType.js';

export type Action =
  | ToolsActions
  | SpectrumActions
  | LoadActions
  | IntegralsActions
  | RangesActions
  | DatabaseActions
  | DimensionsActions
  | AssignmentsActions
  | DomainActions
  | PreferencesActions
  | PeaksActions
  | MoleculeActions
  | ZonesActions
  | FiltersActions
  | CorrelationsActions
  | ActionType<'INITIALIZE_NMRIUM'>
  | ActionType<'SECRET_THROW_ERROR', { randomNumber: number }>
  | InsetsActions;
// // eslint-disable-next-line @typescript-eslint/ban-types
// | { type: string & {}; payload?: Object };

type Dispatch = (action: Action) => void;

const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}

import { createContext, useContext } from 'react';

import { AssignmentsActions } from '../reducer/actions/AssignmentsActions.js';
import { CorrelationsActions } from '../reducer/actions/CorrelationsActions.js';
import { DatabaseActions } from '../reducer/actions/DatabaseActions.js';
import { DimensionsActions } from '../reducer/actions/DimensionsActions.js';
import { DomainActions } from '../reducer/actions/DomainActions.js';
import { FiltersActions } from '../reducer/actions/FiltersActions.js';
import { IntegralsActions } from '../reducer/actions/IntegralsActions.js';
import { LoadActions } from '../reducer/actions/LoadActions.js';
import { MoleculeActions } from '../reducer/actions/MoleculeActions.js';
import { PeaksActions } from '../reducer/actions/PeaksActions.js';
import { PreferencesActions } from '../reducer/actions/PreferencesActions.js';
import { RangesActions } from '../reducer/actions/RangesActions.js';
import { SpectrumActions } from '../reducer/actions/SpectraActions.js';
import { SpectraAnalysisActions } from '../reducer/actions/SpectraAnalysisAction.js';
import { ToolsActions } from '../reducer/actions/ToolsActions.js';
import { ZonesActions } from '../reducer/actions/ZonesActions.js';
import { ActionType } from '../reducer/types/ActionType.js';

export type Action =
  | ToolsActions
  | SpectrumActions
  | SpectraAnalysisActions
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
  | ActionType<'SECRET_THROW_ERROR', { randomNumber: number }>;
// // eslint-disable-next-line @typescript-eslint/ban-types
// | { type: string & {}; payload?: Object };

export type Dispatch = (action: Action) => void;

export const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}

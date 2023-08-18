import { createContext, useContext } from 'react';

import { AssignmentsActions } from '../reducer/actions/AssignmentsActions';
import { CorrelationsActions } from '../reducer/actions/CorrelationsActions';
import { DatabaseActions } from '../reducer/actions/DatabaseActions';
import { DimensionsActions } from '../reducer/actions/DimensionsActions';
import { DomainActions } from '../reducer/actions/DomainActions';
import { FiltersActions } from '../reducer/actions/FiltersActions';
import { IntegralsActions } from '../reducer/actions/IntegralsActions';
import { LoadActions } from '../reducer/actions/LoadActions';
import { MoleculeActions } from '../reducer/actions/MoleculeActions';
import { PeaksActions } from '../reducer/actions/PeaksActions';
import { PreferencesActions } from '../reducer/actions/PreferencesActions';
import { RangesActions } from '../reducer/actions/RangesActions';
import { SpectraAnalysisActions } from '../reducer/actions/SpectraAnalysisAction';
import { SpectrumActions } from '../reducer/actions/SpectrumsActions';
import { ToolsActions } from '../reducer/actions/ToolsActions';
import { ZonesActions } from '../reducer/actions/ZonesActions';
import { ActionType } from '../reducer/types/ActionType';

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

import { createContext, useContext } from 'react';

import { AssignmentsActions } from '../reducer/actions/AssignmentsActions';
import { DatabaseActions } from '../reducer/actions/DatabaseActions';
import { DimensionsActions } from '../reducer/actions/DimensionsActions';
import { GlobalActions } from '../reducer/actions/GlobalActions';
import { IntegralsActions } from '../reducer/actions/IntegralsActions';
import { LoadActions } from '../reducer/actions/LoadActions';
import { RangesActions } from '../reducer/actions/RangesActions';
import { SpectraAnalysisActions } from '../reducer/actions/SpectraAnalysisAction';
import { SpectrumActions } from '../reducer/actions/SpectrumsActions';
import { ToolsActions } from '../reducer/actions/ToolsActions';

export type Action =
  | ToolsActions
  | SpectrumActions
  | SpectraAnalysisActions
  | GlobalActions
  | LoadActions
  | IntegralsActions
  | RangesActions
  | DatabaseActions
  | DimensionsActions
  | AssignmentsActions
  // eslint-disable-next-line @typescript-eslint/ban-types
  | { type: string & {}; payload?: Object };

type Dispatch = (action: Action) => void;

export const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}

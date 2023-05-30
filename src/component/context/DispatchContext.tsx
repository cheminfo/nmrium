import { createContext, useContext } from 'react';

import { GlobalActions } from '../reducer/actions/GlobalActions';
import { LoadActions } from '../reducer/actions/LoadActions';
import { SpectraAnalysisActions } from '../reducer/actions/SpectraAnalysisAction';
import { SpectrumActions } from '../reducer/actions/SpectrumsActions';
import { ToolsActions } from '../reducer/actions/ToolsActions';

export type Action =
  | ToolsActions
  | SpectrumActions
  | SpectraAnalysisActions
  | GlobalActions
  | LoadActions
  // eslint-disable-next-line @typescript-eslint/ban-types
  | { type: string & {}; payload?: Object };

type Dispatch = (action: Action) => void;

export const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}

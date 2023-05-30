import { createContext, useContext } from 'react';

import { SpectraAnalysisActions } from '../reducer/actions/SpectraAnalysisAction';
import { SpectrumActions } from '../reducer/actions/SpectrumsActions';
import { ToolsActions } from '../reducer/actions/ToolsActions';

export type Action =
  | ToolsActions
  | SpectrumActions
  | SpectraAnalysisActions
  // eslint-disable-next-line @typescript-eslint/ban-types
  | { type: string & {}; payload?: Object };

type Dispatch = (action: Action) => void;

export const dispatchContext = createContext<Dispatch>(() => null);

export const DispatchProvider = dispatchContext.Provider;

export function useDispatch(): Dispatch {
  return useContext(dispatchContext);
}

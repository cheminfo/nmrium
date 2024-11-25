import { produce } from 'immer';
import type { NmriumState } from 'nmr-load-save';
import { readNMRiumObject } from 'nmr-load-save';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { toJSON } from '../../data/SpectraManager.js';
import { ChartDataProvider } from '../context/ChartContext.js';
import { DispatchProvider } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { sortSpectra, useSortSpectra } from '../context/SortSpectraContext.js';
import checkActionType from '../reducer/IgnoreActions.js';
import {
  initialState,
  initState,
  spectrumReducer,
} from '../reducer/Reducer.js';

import type { NMRiumChangeCb, NMRiumData } from './types.js';

interface NMRiumStateProviderProps {
  children: ReactNode;
  onChange: NMRiumChangeCb | undefined;
  nmriumData: NMRiumData | undefined;
}

const defaultData: NMRiumData = {
  spectra: [],
};

export default function NMRiumStateProvider(props: NMRiumStateProviderProps) {
  const { children, onChange, nmriumData = defaultData } = props;

  const { logger } = useLogger();
  const preferencesState = usePreferences();
  const { dispatch: dispatchPreferences } = preferencesState;

  const [state, dispatchRaw] = useReducer(
    spectrumReducer,
    initialState,
    initState,
  );

  const dispatch = useCallback<typeof dispatchRaw>(
    (action) => {
      logger.trace({ action }, `Dispatch main reducer action: ${action.type}`);
      dispatchRaw(action);
    },
    [logger],
  );

  const {
    source,
    data: spectraData,
    molecules,
    correlations,
    actionType,
    view,
  } = state;

  const stateRef = useRef<NmriumState>();

  const handleChange = useRef<NMRiumChangeCb | undefined>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const { workspace, workspaces = {} } = preferencesState;
    stateRef.current = toJSON(
      { data: spectraData, molecules, correlations, source, view, actionType },
      { current: workspaces[workspace.current] },
      { serialize: false, exportTarget: 'onChange' },
    );
  }, [
    actionType,
    correlations,
    molecules,
    preferencesState,
    source,
    spectraData,
    view,
  ]);

  useEffect(() => {
    // trigger onChange callback if data object changed
    if (checkActionType(actionType)) {
      handleChange.current?.(stateRef.current as NmriumState, 'data');
    }
  }, [actionType, correlations, molecules, source, spectraData]);

  useEffect(() => {
    // trigger onChange callback if view object changed
    handleChange.current?.(stateRef.current as NmriumState, 'view');
  }, [view]);

  useEffect(() => {
    // trigger onChange callback if settings changed
    handleChange.current?.(stateRef.current as NmriumState, 'settings');
  }, [preferencesState]);

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING_FLAG',
      payload: { isLoading: true },
    });
    if (nmriumData) {
      void readNMRiumObject(nmriumData)
        .then((nmriumState) => {
          if (nmriumState?.settings) {
            dispatchPreferences({
              type: 'SET_WORKSPACE',
              payload: {
                data: nmriumState.settings,
                workspaceSource: 'nmriumFile',
              },
            });
          }
          dispatch({ type: 'INITIATE', payload: { nmriumState, logger } });
        })
        .catch((error: unknown) => {
          dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });

          if (error instanceof Error) {
            // eslint-disable-next-line no-alert
            globalThis.alert(error.message);
          }
          reportError(error);
        });
    }
  }, [nmriumData, dispatch, dispatchPreferences, logger]);
  const { sortOptions } = useSortSpectra();

  const spectra = useMemo(() => {
    if (sortOptions) {
      return sortSpectra(state.data, sortOptions);
    }
    return state.data;
  }, [sortOptions, state.data]);

  const updatedState = useMemo(() => {
    return produce(state, (draft) => {
      draft.data = spectra;
    });
  }, [state, spectra]);

  return (
    <DispatchProvider value={dispatch}>
      <ChartDataProvider value={updatedState}>{children}</ChartDataProvider>
    </DispatchProvider>
  );
}

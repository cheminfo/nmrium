import { NmriumState, readNMRiumObject } from 'nmr-load-save';
import { ReactNode, useCallback, useEffect, useReducer, useRef } from 'react';

import { toJSON } from '../../data/SpectraManager';
import { ChartDataProvider } from '../context/ChartContext';
import { DispatchProvider } from '../context/DispatchContext';
import { useLogger } from '../context/LoggerContext';
import { usePreferences } from '../context/PreferencesContext';
import checkActionType from '../reducer/IgnoreActions';
import { spectrumReducer, initialState, initState } from '../reducer/Reducer';

import { NMRiumChangeCb, NMRiumData } from './types';

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
          dispatch({ type: 'INITIATE', payload: { nmriumState } });
        })
        .catch((error) => {
          dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });

          // eslint-disable-next-line no-alert
          alert(error.message);
          reportError(error);
        });
    }
  }, [nmriumData, dispatch]);

  return (
    <DispatchProvider value={dispatch}>
      <ChartDataProvider value={state}>{children}</ChartDataProvider>
    </DispatchProvider>
  );
}

import type { NmriumState } from '@zakodium/nmrium-core';
import { FileCollection } from 'file-collection';
import { produce } from 'immer';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { toJSON } from '../../data/SpectraManager.js';
import { ChartDataProvider } from '../context/ChartContext.js';
import { useCore } from '../context/CoreContext.js';
import { DispatchProvider } from '../context/DispatchContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { sortSpectra, useSortSpectra } from '../context/SortSpectraContext.js';
import checkActionType from '../reducer/IgnoreActions.js';
import {
  initState,
  initialState,
  spectrumReducer,
} from '../reducer/Reducer.js';

import type { NMRiumChangeCb } from './types.js';

interface NMRiumStateProviderProps {
  children: ReactNode;
  onChange: NMRiumChangeCb | undefined;
  state: Partial<NmriumState> | undefined;
  aggregator: FileCollection | undefined;
}

export default function NMRiumStateProvider(props: NMRiumStateProviderProps) {
  const {
    children,
    onChange,
    state: externalState,
    aggregator: externalAggregator,
  } = props;

  const core = useCore();
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
    sources,
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
      core,
      {
        data: spectraData,
        molecules,
        correlations,
        sources,
        view,
        actionType,
      },
      { current: workspaces[workspace.current] },
      { serialize: false, exportTarget: 'onChange' },
    ) as NmriumState;
  }, [
    actionType,
    core,
    correlations,
    molecules,
    preferencesState,
    sources,
    spectraData,
    view,
  ]);

  useEffect(() => {
    // trigger onChange callback if data object changed
    if (checkActionType(actionType)) {
      handleChange.current?.(stateRef.current as NmriumState, 'data');
    }
  }, [actionType, correlations, molecules, sources, spectraData]);

  useEffect(() => {
    // trigger onChange callback if view object changed
    handleChange.current?.(stateRef.current as NmriumState, 'view');
  }, [view]);

  useEffect(() => {
    // trigger onChange callback if settings changed
    handleChange.current?.(stateRef.current as NmriumState, 'settings');
  }, [preferencesState]);

  const loggerRef = useRef(logger);
  useEffect(() => void (loggerRef.current = logger));
  useEffect(() => {
    const logger = loggerRef.current;

    dispatch({
      type: 'SET_LOADING_FLAG',
      payload: { isLoading: true },
    });

    function loadingEmptyState() {
      dispatch({
        type: 'INITIATE',
        payload: { nmriumState: {}, aggregator: new FileCollection() },
      });
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
    }

    if (externalState && externalAggregator) {
      if (externalState.version !== core.version) {
        logger.warn(
          externalState,
          `The provided state is for a different version of NMRium (${externalState.version}) than the current version (${core.version}). The provided state is ignored.`,
        );
        loadingEmptyState();
        return;
      }

      if (externalState.settings) {
        dispatchPreferences({
          type: 'SET_WORKSPACE',
          payload: {
            data: externalState.settings,
            workspaceSource: 'nmriumFile',
          },
        });
      }
      dispatch({
        type: 'INITIATE',
        payload: { nmriumState: externalState, aggregator: externalAggregator },
      });
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
      return;
    }

    if (externalState && !externalAggregator) {
      logger.warn(
        externalState,
        '`aggregator` is mandatory with `state` props. The provided `state` is ignored',
      );
    }

    loadingEmptyState();
  }, [dispatch, dispatchPreferences, core, externalState, externalAggregator]);
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

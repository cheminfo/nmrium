import { readNMRiumObject, NmriumState } from 'nmr-load-save';
import {
  useEffect,
  useReducer,
  useRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { useOnOff } from 'react-science/ui';
import { useFullscreen } from 'react-use';

import { toJSON } from '../../data/SpectraManager';
import { AssignmentProvider } from '../assignment';
import { ChartDataProvider } from '../context/ChartContext';
import { DispatchProvider } from '../context/DispatchContext';
import { GlobalProvider } from '../context/GlobalContext';
import { LoggerProvider } from '../context/LoggerContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { AlertProvider } from '../elements/popup/Alert';
import { ModalProvider } from '../elements/popup/Modal';
import { HighlightProvider } from '../highlight';
import { defaultGetSpinner, SpinnerProvider } from '../loader/SpinnerContext';
import checkActionType from '../reducer/IgnoreActions';
import { spectrumReducer, initialState, initState } from '../reducer/Reducer';
import preferencesReducer, {
  preferencesInitialState,
  initPreferencesState,
} from '../reducer/preferences/preferencesReducer';
import { getBlob } from '../utility/export';

import { InnerNMRiumContents } from './InnerNMRiumContents';
import type { NMRiumProps, NMRiumRef } from './NMRium';
import { NMRiumChangeCb, NMRiumData } from './types';

type InnerNMRiumProps = Omit<NMRiumProps, 'onError'> & {
  innerRef: ForwardedRef<NMRiumRef>;
};

const defaultData: NMRiumData = {
  spectra: [],
};

export function InnerNMRium({
  data: dataProp = defaultData,
  workspace,
  customWorkspaces,
  preferences,
  getSpinner = defaultGetSpinner,
  onChange,
  emptyText,
  innerRef,
}: InnerNMRiumProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWrapperRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [enableFullscreen, , disableFullscreen, toggleFullscreen] =
    useOnOff(false);
  const mainDivRef = useRef<HTMLDivElement>(null);

  const handleChange = useRef<NMRiumChangeCb | undefined>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  const isFullscreenEnabled = useFullscreen(rootRef, enableFullscreen, {
    onClose: disableFullscreen,
  });

  const [state, dispatch] = useReducer(
    spectrumReducer,
    initialState,
    initState,
  );
  const [preferencesState, dispatchPreferences] = useReducer(
    preferencesReducer,
    preferencesInitialState,
    initPreferencesState,
  );

  const {
    displayerMode,
    source,
    data: spectraData,
    molecules,
    correlations,
    actionType,
    view,
  } = state;

  const stateRef = useRef<NmriumState>();

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
    rootRef.current?.focus();
  }, [isFullscreenEnabled]);

  useEffect(() => {
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        preferences,
        workspace,
        customWorkspaces,
        dispatch: dispatchPreferences,
      },
    });
  }, [customWorkspaces, preferences, workspace]);

  useImperativeHandle(
    innerRef,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef?.current ? getBlob(rootRef.current, 'nmrSVG') : null;
      },
    }),
    [],
  );

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING_FLAG',
      payload: { isLoading: true },
    });
    if (dataProp) {
      void readNMRiumObject(dataProp)
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
  }, [dataProp]);

  useEffect(() => {
    const div = mainDivRef.current;
    if (!div) {
      return;
    }
    function mouseEnterHandler() {
      dispatch({
        type: 'SET_MOUSE_OVER_DISPLAYER',
        payload: { isMouseOverDisplayer: true },
      });
    }
    function mouseLeaveHandler() {
      dispatch({
        type: 'SET_MOUSE_OVER_DISPLAYER',
        payload: { isMouseOverDisplayer: false },
      });
    }
    div.addEventListener('mouseenter', mouseEnterHandler);
    div.addEventListener('mouseleave', mouseLeaveHandler);
    return () => {
      div.removeEventListener('mouseenter', mouseEnterHandler);
      div.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, []);

  return (
    <div ref={mainDivRef} style={{ height: '100%', position: 'relative' }}>
      <GlobalProvider
        value={{
          rootRef: rootRef.current,
          elementsWrapperRef: elementsWrapperRef.current,
          viewerRef: viewerRef.current,
        }}
      >
        <PreferencesProvider value={preferencesState}>
          <LoggerProvider>
            <AlertProvider wrapperRef={elementsWrapperRef.current}>
              <DispatchProvider value={dispatch}>
                <ChartDataProvider value={state}>
                  <ModalProvider wrapperRef={elementsWrapperRef.current}>
                    <HighlightProvider>
                      <AssignmentProvider spectraData={spectraData}>
                        <SpinnerProvider value={getSpinner}>
                          <InnerNMRiumContents
                            displayerMode={displayerMode}
                            isFullscreenEnabled={isFullscreenEnabled}
                            toggleFullscreen={toggleFullscreen}
                            emptyText={emptyText}
                            elementsWrapperRef={elementsWrapperRef}
                            rootRef={rootRef}
                            viewerRef={viewerRef}
                          />
                        </SpinnerProvider>
                      </AssignmentProvider>
                    </HighlightProvider>
                  </ModalProvider>
                </ChartDataProvider>
              </DispatchProvider>
            </AlertProvider>
          </LoggerProvider>
        </PreferencesProvider>
      </GlobalProvider>
    </div>
  );
}

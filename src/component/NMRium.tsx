/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { RootLayout } from 'analysis-ui-components';
import { CorrelationData } from 'nmr-correlation';
import {
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  useRef,
  memo,
  Reducer,
  ReactElement,
  ReactNode,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useToggle, useFullscreen } from 'react-use';

import { toJSON } from '../data/SpectraManager';
import { Datum1D } from '../data/types/data1d';
import { Datum2D } from '../data/types/data2d';
import checkModifierKeyActivated from '../data/utilities/checkModifierKeyActivated';
import { NMRiumDataReturn } from '../types/NMRiumDataReturn';
import { NMRiumGeneralPreferences } from '../types/NMRiumGeneralPreferences';
import { NMRiumPanelPreferences } from '../types/NMRiumPanelPreferences';
import { NMRiumToolBarPreferences } from '../types/NMRiumToolBarPreferences';

import Viewer1D from './1d/Viewer1D';
import Viewer2D from './2d/Viewer2D';
import ErrorOverlay from './ErrorOverlay';
import KeysListenerTracker from './EventsTrackers/KeysListenerTracker';
import { SplitPaneWrapper } from './SplitPaneWrapper';
import { AssignmentProvider } from './assignment';
import { ChartDataProvider } from './context/ChartContext';
import { DispatchProvider } from './context/DispatchContext';
import { GlobalProvider } from './context/GlobalContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AlertProvider } from './elements/popup/Alert';
import { ModalProvider } from './elements/popup/Modal';
import Header from './header/Header';
import { HighlightProvider } from './highlight';
import DropZone from './loader/DropZone';
import { defaultGetSpinner, SpinnerProvider } from './loader/SpinnerContext';
import Panels from './panels/Panels';
import checkActionType from './reducer/IgnoreActions';
import {
  spectrumReducer,
  initialState,
  dispatchMiddleware,
  initState,
  State,
} from './reducer/Reducer';
import { DISPLAYER_MODE } from './reducer/core/Constants';
import preferencesReducer, {
  preferencesInitialState,
  PreferencesState,
  initPreferencesState,
} from './reducer/preferences/preferencesReducer';
import {
  INITIATE,
  SET_LOADING_FLAG,
  SET_MOUSE_OVER_DISPLAYER,
} from './reducer/types/Types';
import ToolBar from './toolbar/ToolBar';

const viewerContainerStyle = css`
  border: 0.55px #e6e6e6 solid;
  display: flex;
  flex: 1;
  flex-direction: 'column';
  height: 100%;
  margin-left: -1px;
`;

const containerStyles = css`
  background-color: white;
  width: 100%;
  display: block;
  height: 100%;
  font-size: 14px;

  div:focus {
    outline: none !important;
  }

  button {
    cursor: pointer;
    &:disabled {
      cursor: default;
    }
  }

  button:active,
  button:hover,
  button:focus,
  [type='button']:focus,
  button {
    outline: none !important;
  }

  * {
    -webkit-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .SplitPane {
    height: 100%;
  }
`;

export type { NMRiumDataReturn } from '../types/NMRiumDataReturn';

export type NMRiumWorkspace =
  | 'exercise'
  | 'process1D'
  | 'default'
  | 'prediction'
  | 'embedded';

export interface NMRiumProps {
  data?: NMRiumData;
  onDataChange?: (data: NMRiumDataReturn) => void;
  workspace?: NMRiumWorkspace;
  preferences?: NMRiumPreferences;
  emptyText?: ReactNode;
  /**
   * Returns a custom spinner that will be rendered while loading data.
   */
  getSpinner?: () => ReactElement;
}

export type NMRiumPreferences = Partial<{
  general: Partial<NMRiumGeneralPreferences>;
  panels: Partial<NMRiumPanelPreferences>;
  toolBarButtons: Partial<NMRiumToolBarPreferences>;
}>;

export type Molecules = Array<{ molfile: string }>;
export type Spectra = Array<Datum1D | Datum2D>;

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface NMRiumData {
  molecules?: Molecules;
  spectra: DeepPartial<Spectra>;
  correlations?: CorrelationData;
}

const defaultPreferences = {};
const defaultData: NMRiumData = {
  spectra: [],
};

function NMRium(props: NMRiumProps) {
  return (
    <RootLayout style={{ width: '100%' }}>
      <ErrorBoundary FallbackComponent={ErrorOverlay}>
        <InnerNMRium {...props} />
      </ErrorBoundary>
    </RootLayout>
  );
}

function InnerNMRium({
  data: dataProp = defaultData,
  workspace,
  preferences = defaultPreferences,
  getSpinner = defaultGetSpinner,
  onDataChange,
  emptyText,
}: NMRiumProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWrapperRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [show, toggle] = useToggle(false);

  const isFullscreen = useFullscreen(rootRef, show, {
    onClose: () => {
      toggle(false);
    },
  });

  const [state, dispatch] = useReducer<Reducer<State, any>, State>(
    spectrumReducer,
    initialState,
    initState,
  );

  const [preferencesState, dispatchPreferences] = useReducer<
    Reducer<PreferencesState, any>,
    PreferencesState
  >(preferencesReducer, preferencesInitialState, initPreferencesState);

  const { displayerMode, data: spectraData } = state;

  useEffect(() => {
    if (checkActionType(state.actionType)) {
      onDataChange?.(toJSON(state));
    }
  }, [onDataChange, state]);

  const dispatchMiddleWare = useMemo(() => {
    return dispatchMiddleware(dispatch);
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullscreen]);

  useEffect(() => {
    dispatchPreferences({
      type: 'INIT_PREFERENCES',
      payload: {
        display: preferences,
        workspace,
        dispatch: dispatchPreferences,
      },
    });
  }, [preferences, workspace]);

  useEffect(() => {
    dispatchMiddleWare({ type: SET_LOADING_FLAG, isLoading: true });
    if (dataProp) {
      dispatchMiddleWare({ type: INITIATE, payload: dataProp });
    }
  }, [dataProp, dispatchMiddleWare]);

  const preventContextMenuHandler = useCallback((e) => {
    if (!checkModifierKeyActivated(e)) {
      e.preventDefault();
    }
  }, []);

  const mainDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const div = mainDivRef.current;
    if (!div) {
      return;
    }
    function mouseEnterHandler() {
      dispatchMiddleWare({ type: SET_MOUSE_OVER_DISPLAYER, payload: true });
    }
    function mouseLeaveHandler() {
      dispatchMiddleWare({ type: SET_MOUSE_OVER_DISPLAYER, payload: false });
    }
    div.addEventListener('mouseenter', mouseEnterHandler);
    div.addEventListener('mouseleave', mouseLeaveHandler);
    return () => {
      div.removeEventListener('mouseenter', mouseEnterHandler);
      div.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, [dispatchMiddleWare]);

  return (
    <GlobalProvider
      value={{
        rootRef: rootRef.current,
        elementsWrapperRef: elementsWrapperRef.current,
        viewerRef: viewerRef.current,
      }}
    >
      <PreferencesProvider value={preferencesState}>
        <div ref={mainDivRef} style={{ height: '100%', position: 'relative' }}>
          <AlertProvider wrapperRef={elementsWrapperRef.current}>
            <DispatchProvider value={dispatchMiddleWare}>
              <ChartDataProvider value={state}>
                <ModalProvider wrapperRef={elementsWrapperRef.current}>
                  <HighlightProvider>
                    <AssignmentProvider spectraData={spectraData}>
                      <SpinnerProvider value={getSpinner}>
                        <div
                          className="nmrium-container"
                          ref={rootRef}
                          css={containerStyles}
                          onContextMenu={preventContextMenuHandler}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <DropZone>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: 'white',
                                width: '100%',
                              }}
                            >
                              <Header
                                isFullscreen={isFullscreen}
                                onMaximize={toggle}
                              />

                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  height: '100%',
                                }}
                              >
                                <ToolBar />
                                <SplitPaneWrapper>
                                  <div css={viewerContainerStyle}>
                                    <KeysListenerTracker />
                                    <div
                                      data-test-id="viewer"
                                      ref={viewerRef}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                      }}
                                    >
                                      {displayerMode ===
                                      DISPLAYER_MODE.DM_1D ? (
                                        <Viewer1D emptyText={emptyText} />
                                      ) : (
                                        <Viewer2D emptyText={emptyText} />
                                      )}
                                    </div>
                                  </div>
                                  <Panels />
                                </SplitPaneWrapper>

                                <div
                                  ref={elementsWrapperRef}
                                  key={String(isFullscreen)}
                                  id="main-wrapper"
                                  style={{
                                    position: 'absolute',
                                    pointerEvents: 'none',
                                    zIndex: 0,
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                  }}
                                />
                              </div>
                            </div>
                          </DropZone>
                        </div>
                      </SpinnerProvider>
                    </AssignmentProvider>
                  </HighlightProvider>
                </ModalProvider>
              </ChartDataProvider>
            </DispatchProvider>
          </AlertProvider>
        </div>
      </PreferencesProvider>
    </GlobalProvider>
  );
}
export default memo(NMRium);

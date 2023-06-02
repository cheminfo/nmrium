/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { CorrelationData } from 'nmr-correlation';
import { readNMRiumObject, Source, NmriumState, Spectrum } from 'nmr-load-save';
import {
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  useRef,
  memo,
  ReactElement,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithComponent,
} from 'react-error-boundary';
import { RootLayout, useOnOff } from 'react-science/ui';
import { useFullscreen } from 'react-use';

import { toJSON } from '../data/SpectraManager';
import checkModifierKeyActivated from '../data/utilities/checkModifierKeyActivated';

import Viewer1D from './1d/Viewer1D';
import FloatMoleculeStructures from './1d-2d/components/FloatMoleculeStructures';
import Viewer2D from './2d/Viewer2D';
import ErrorOverlay from './ErrorOverlay';
import KeysListenerTracker from './EventsTrackers/KeysListenerTracker';
import { SplitPaneWrapper } from './SplitPaneWrapper';
import { AssignmentProvider } from './assignment';
import { ChartDataProvider } from './context/ChartContext';
import { DispatchProvider } from './context/DispatchContext';
import { GlobalProvider } from './context/GlobalContext';
import { LoggerProvider } from './context/LoggerContext';
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
} from './reducer/Reducer';
import { DISPLAYER_MODE } from './reducer/core/Constants';
import preferencesReducer, {
  preferencesInitialState,
  initPreferencesState,
} from './reducer/preferences/preferencesReducer';
import ToolBar from './toolbar/ToolBar';
import { BlobObject, getBlob } from './utility/export';
import {
  CustomWorkspaces,
  WorkspacePreferences as NMRiumPreferences,
} from './workspaces/Workspace';

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

  div:focus {
    outline: none !important;
  }

  button {
    cursor: pointer;
  }

  button,
  button:active,
  button:hover,
  button:focus,
  [type='button']:focus {
    outline: none !important;
  }

  button:disabled {
    cursor: default;
  }

  * {
    -webkit-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-select: none;
  }
`;
export { serializeNmriumState } from 'nmr-load-save';
export type { NmriumState } from 'nmr-load-save';
export type { WorkspacePreferences as NMRiumPreferences } from './workspaces/Workspace';

export type NMRiumWorkspace =
  | 'exercise'
  | 'process1D'
  | 'default'
  | 'prediction'
  | 'embedded'
  | 'assignment'
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export type OnNMRiumChange = (
  state: NmriumState,
  source: 'data' | 'view' | 'settings',
) => void;

export interface NMRiumProps {
  data?: NMRiumData;
  onChange?: OnNMRiumChange;
  onError?: ErrorBoundaryPropsWithComponent['onError'];
  workspace?: NMRiumWorkspace;
  customWorkspaces?: CustomWorkspaces;
  preferences?: NMRiumPreferences;
  emptyText?: ReactNode;
  /**
   * Returns a custom spinner that will be rendered while loading data.
   */
  getSpinner?: () => ReactElement;
}

export type Molecules = Array<{ molfile: string }>;

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface NMRiumData {
  source?: Source;
  molecules?: Molecules;
  spectra: DeepPartial<Spectrum>[];
  correlations?: CorrelationData;
}

const defaultData: NMRiumData = {
  spectra: [],
};

export interface NMRiumRef {
  getSpectraViewerAsBlob: () => BlobObject | null;
}

const NMRium = forwardRef<NMRiumRef, NMRiumProps>(function NMRium(
  props: NMRiumProps,
  ref,
) {
  const { onError, ...otherProps } = props;
  return (
    <RootLayout style={{ width: '100%' }}>
      <ErrorBoundary FallbackComponent={ErrorOverlay} onError={onError}>
        <InnerNMRium {...otherProps} innerRef={ref} />
      </ErrorBoundary>
    </RootLayout>
  );
});

type InnerNMRiumProps = Omit<NMRiumProps, 'onError'> & {
  innerRef: ForwardedRef<NMRiumRef>;
};

function InnerNMRium({
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
  const [show, , setOff, toggle] = useOnOff(false);

  const handleChange = useRef<OnNMRiumChange | undefined>(onChange);
  useEffect(() => {
    handleChange.current = onChange;
  }, [onChange]);

  const isFullscreen = useFullscreen(rootRef, show, {
    onClose: setOff,
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
    dispatchMiddleWare({
      type: 'SET_LOADING_FLAG',
      payload: { isLoading: true },
    });
    if (dataProp) {
      void readNMRiumObject(dataProp)
        .then((nmriumState) => {
          dispatchMiddleWare({ type: 'INITIATE', payload: { nmriumState } });
        })
        .catch((error) => {
          dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
          // eslint-disable-next-line no-alert
          alert(error.message);
          reportError(error);
        });
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
      dispatchMiddleWare({
        type: 'SET_MOUSE_OVER_DISPLAYER',
        payload: { isMouseOverDisplayer: true },
      });
    }
    function mouseLeaveHandler() {
      dispatchMiddleWare({
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
          <LoggerProvider>
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
                                        id="nmrium-viewer"
                                        data-test-id="viewer"
                                        ref={viewerRef}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          position: 'relative',
                                        }}
                                      >
                                        <FloatMoleculeStructures />
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
                                      zIndex: 2,
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
          </LoggerProvider>
        </div>
      </PreferencesProvider>
    </GlobalProvider>
  );
}
export default memo(NMRium);

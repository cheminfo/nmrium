/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { RootLayout, SplitPane } from 'analysis-ui-components';
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

import { Datum1D } from '../data/types/data1d';
import { Datum2D } from '../data/types/data2d';
import checkModifierKeyActivated from '../data/utilities/checkModifierKeyActivated';
import { PanelPreferencesType } from '../types/PanelPreferencesType';

import Viewer1D from './1d/Viewer1D';
import Viewer2D from './2d/Viewer2D';
import ErrorOverlay from './ErrorOverlay';
import KeysListenerTracker from './EventsTrackers/KeysListenerTracker';
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
} from './reducer/preferencesReducer';
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
    color: black;
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

  .Resizer.vertical:after {
    content: '\\22EE';
    top: 50%;
    color: black;
    position: absolute;
    font-size: 14px;
  }

  .Resizer.vertical {
    padding: 2px;
  }

  .Resizer.vertical:hover {
    background-color: #dfdfdf !important;
    border-left: 0.55px #bbbbbb;
 solid;
    border-right: 0.55px #bbbbbb solid;
  }
`;

export type NMRiumWorkspace =
  | 'exercise'
  | 'process1D'
  | 'default'
  | 'prediction';

export interface NMRiumProps {
  data?: NMRiumData;
  onDataChange?: (data: State) => void;
  workspace?: NMRiumWorkspace;
  preferences?: NMRiumPreferences;
  emptyText?: ReactNode;
  /**
   * Returns a custom spinner that will be rendered while loading data.
   */
  getSpinner?: () => ReactElement;
}

export type NMRiumPreferences = Partial<{
  general: Partial<{
    disableMultipletAnalysis: boolean;
    hideSetSumFromMolecule: boolean;
    hideGeneralSettings: boolean;
    experimentalFeatures: PanelPreferencesType;
  }>;
  panels: Partial<{
    spectraPanel: PanelPreferencesType;
    informationPanel: PanelPreferencesType;
    peaksPanel: PanelPreferencesType;
    integralsPanel: PanelPreferencesType;
    rangesPanel: PanelPreferencesType;
    structuresPanel: PanelPreferencesType;
    filtersPanel: PanelPreferencesType;
    zonesPanel: PanelPreferencesType;
    summaryPanel: PanelPreferencesType;
    multipleSpectraAnalysisPanel: PanelPreferencesType;
    databasePanel: PanelPreferencesType;
    predictionPanel: PanelPreferencesType;
  }>;
  toolBarButtons: Partial<{
    zoomTool: boolean;
    zoomOutTool: boolean;
    import: boolean;
    exportAs: boolean;
    spectraStackAlignments: boolean;
    spectraCenterAlignments: boolean;
    realImaginary: boolean;
    peakTool: boolean;
    integralTool: boolean;
    zonePickingTool: boolean;
    slicingTool: boolean;
    autoRangesTool: boolean;
    zeroFillingTool: boolean;
    phaseCorrectionTool: boolean;
    baseLineCorrectionTool: boolean;
    FFTTool: boolean;
    multipleSpectraAnalysisTool: boolean;
    exclusionZonesTool: boolean;
  }>;
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
  const elementsWraperRef = useRef<HTMLDivElement>(null);
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
      onDataChange?.(state);
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
  const mouseEnterHandler = useCallback(() => {
    dispatchMiddleWare({ type: SET_MOUSE_OVER_DISPLAYER, payload: true });
  }, [dispatchMiddleWare]);
  const mouseLeaveHandler = useCallback(() => {
    dispatchMiddleWare({ type: SET_MOUSE_OVER_DISPLAYER, payload: false });
  }, [dispatchMiddleWare]);

  return (
    <GlobalProvider
      value={{
        rootRef: rootRef.current,
        elementsWraperRef: elementsWraperRef.current,
      }}
    >
      <PreferencesProvider value={preferencesState}>
        <div
          onMouseEnter={mouseEnterHandler}
          onMouseLeave={mouseLeaveHandler}
          style={{ height: '100%', position: 'relative' }}
        >
          <AlertProvider wrapperRef={elementsWraperRef.current}>
            <DispatchProvider value={dispatchMiddleWare}>
              <ChartDataProvider value={state}>
                <ModalProvider wrapperRef={elementsWraperRef.current}>
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
                                <SplitPane
                                  initialSeparation="590px"
                                  orientation="horizontal"
                                  sideSeparation="end"
                                >
                                  <div css={viewerContainerStyle}>
                                    <KeysListenerTracker />
                                    <div
                                      data-test-id="viewer"
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
                                </SplitPane>

                                <div
                                  ref={elementsWraperRef}
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

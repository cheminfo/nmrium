/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import lodash from 'lodash';
import OCL from 'openchemlib/full';
import PropTypes from 'prop-types';
import {
  useEffect,
  useCallback,
  useReducer,
  useState,
  useMemo,
  useRef,
  memo,
  Reducer,
  CSSProperties,
} from 'react';
import { initOCL } from 'react-ocl-nmr';
import SplitPane from 'react-split-pane';
import { useToggle, useFullscreen } from 'react-use';

import { Analysis } from '../data/Analysis';
import checkModifierKeyActivated from '../data/utilities/checkModifierKeyActivated';

import Viewer1D from './1d/Viewer1D';
import Viewer2D from './2d/Viewer2D';
import ErrorBoundary from './ErrorBoundary';
import KeysListenerTracker from './EventsTrackers/KeysListenerTracker';
import { AssignmentProvider } from './assignment';
import helpList, { setBaseUrl } from './constants/help';
import { ChartDataProvider } from './context/ChartContext';
import { DispatchProvider } from './context/DispatchContext';
import { GlobalProvider } from './context/GlobalContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AlertProvider } from './elements/popup/Alert';
import { HelpProvider } from './elements/popup/Help';
import { ModalProvider } from './elements/popup/Modal';
import Header from './header/Header';
import { HighlightProvider } from './highlight';
import DropZone from './loader/DropZone';
import Panels from './panels/Panels';
import {
  spectrumReducer,
  initialState,
  dispatchMiddleware,
} from './reducer/Reducer';
import { DISPLAYER_MODE } from './reducer/core/Constants';
import {
  preferencesInitialState,
  preferencesReducer,
  INIT_PREFERENCES,
} from './reducer/preferencesReducer';
import { INITIATE, SET_WIDTH, SET_LOADING_FLAG } from './reducer/types/Types';
import ToolBar from './toolbar/ToolBar';

initOCL(OCL);

const splitPaneStyles: Record<
  'container' | 'resizer' | 'pane',
  CSSProperties
> = {
  container: {
    position: 'relative',
    height: 'none',
  },
  resizer: {
    width: 10,
    backgroundColor: '#f7f7f7',
    cursor: 'ew-resize',
  },
  pane: { overflow: 'hidden' },
};

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
    border-left: 0.55px #bbbbbb solid;
    border-right: 0.55px #bbbbbb solid;
  }
`;

export interface NMRDisplayerProps {
  data?: NMRDisplayerData;
  docsBaseUrl?: string;
  onDataChange?: (data: any) => void;
  preferences?: NMRDisplayerPreferences;
}

export type NMRDisplayerPreferences = Partial<{
  general: Partial<{
    disableMultipletAnalysis: boolean;
    hideSetSumFromMolecule: boolean;
  }>;
  panels: Partial<{
    hideSpectraPanel: boolean;
    hideInformationPanel: boolean;
    hidePeaksPanel: boolean;
    hideIntegralsPanel: boolean;
    hideRangesPanel: boolean;
    hideStructuresPanel: boolean;
    hideFiltersPanel: boolean;
    hideZonesPanel: boolean;
    hideSummaryPanel: boolean;
    hideMultipleSpectraAnalysisPanel: boolean;
  }>;
  toolBarButtons: Partial<{
    hideZoomTool: boolean;
    hideZoomOutTool: boolean;
    hideImport: boolean;
    hideExportAs: boolean;
    hideSpectraStackAlignments: boolean;
    hideSpectraCenterAlignments: boolean;
    hideRealImaginary: boolean;
    hidePeakTool: boolean;
    hideIntegralTool: boolean;
    hideAutoRangesTool: boolean;
    hideZeroFillingTool: boolean;
    hidePhaseCorrectionTool: boolean;
    hideBaseLineCorrectionTool: boolean;
    hideFFTTool: boolean;
    hideMultipleSpectraAnalysisTool: boolean;
  }>;
}>;

export interface NMRDisplayerData {
  molecules?: Array<{ molfile: string }>;
  spectra: Array<{
    data?: any;
    id?: string;
    display: {
      name?: string;
    };
    source:
      | {
          jcamp: string;
        }
      | {
          jcampURL: string;
        }
      | {
          original: any;
        };
  }>;
}

function NMRDisplayer({
  data: dataProp,
  onDataChange,
  docsBaseUrl,
  preferences,
}: NMRDisplayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsWraperRef = useRef<HTMLDivElement>(null);
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(rootRef, show, {
    onClose: () => {
      toggle(false);
    },
  });
  const [isRightPanelHide, hideRightPanel] = useState(false);
  const [isResizeEventStart, setResizeEventStart] = useState(false);
  const [helpData, setHelpData] = useState(helpList);

  const [state, dispatch] = useReducer<Reducer<any, any>>(
    spectrumReducer,
    initialState,
  );
  const [preferencesState, dispatchPreferences] = useReducer<Reducer<any, any>>(
    preferencesReducer,
    preferencesInitialState,
  );

  const { selectedTool, displayerMode, data: spectraData } = state;

  useEffect(() => {
    rootRef.current?.focus();
  }, [isFullscreen]);

  useEffect(() => {
    dispatchPreferences({
      type: INIT_PREFERENCES,
      payload: { display: preferences, dispatch: dispatchPreferences },
    });
  }, [preferences]);

  useEffect(() => {
    if (dataProp !== undefined) {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Analysis.build(dataProp || {}).then((object) => {
        dispatch({ type: INITIATE, data: { AnalysisObj: object } });
      });
    }
  }, [dataProp]);

  useEffect(() => {
    setBaseUrl(docsBaseUrl);
    setHelpData(helpList());
  }, [docsBaseUrl]);

  const handleSplitPanelDragFinished = useCallback(
    (size) => {
      if (size && !isRightPanelHide) {
        setResizeEventStart(false);
        dispatch({ type: SET_WIDTH, width: size });
      }
    },
    [isRightPanelHide],
  );

  const dispatchMiddleWare = useMemo(() => {
    function dataChangeHandler(data) {
      onDataChange?.(data);
    }
    return dispatchMiddleware(dispatch, dataChangeHandler);
  }, [onDataChange]);

  const preventAutoHelp = useMemo(() => {
    return lodash.get(
      preferencesState,
      'controllers.help.preventAutoHelp',
      false,
    );
  }, [preferencesState]);

  const rightPanelHandler = useCallback((e) => {
    e.stopPropagation();
    hideRightPanel((prevFlag) => !prevFlag);
  }, []);

  const preventContextMenuHandler = useCallback((e) => {
    if (!checkModifierKeyActivated(e)) {
      e.preventDefault();
    }
  }, []);

  return (
    <ErrorBoundary>
      <GlobalProvider
        value={{
          rootRef: rootRef.current,
          elementsWraperRef: elementsWraperRef.current,
        }}
      >
        <PreferencesProvider value={preferencesState}>
          {/* @ts-expect-error: TODO remove when HelpProvider is migrated */}
          <HelpProvider
            data={helpData}
            wrapperRef={elementsWraperRef.current}
            preventAutoHelp={preventAutoHelp}
          >
            {/* @ts-expect-error: TODO remove when AlertProvider is migrated */}
            <AlertProvider wrapperRef={elementsWraperRef.current}>
              <DispatchProvider value={dispatchMiddleWare}>
                <ChartDataProvider value={{ ...state, isResizeEventStart }}>
                  <ModalProvider wrapperRef={elementsWraperRef.current}>
                    <HighlightProvider>
                      <AssignmentProvider spectraData={spectraData}>
                        <div
                          ref={rootRef}
                          css={containerStyles}
                          onContextMenu={preventContextMenuHandler}
                        >
                          <KeysListenerTracker>
                            <Header
                              isFullscreen={isFullscreen}
                              onMaximize={toggle}
                            />

                            {/* ref={containerRef} */}
                            <div
                              style={{
                                height: 'calc(100% - 36px)',
                                width: '100%',
                                backgroundColor: 'white',
                              }}
                            >
                              <DropZone>
                                <ToolBar selectedTool={selectedTool} />
                                <SplitPane
                                  style={splitPaneStyles.container}
                                  resizerStyle={splitPaneStyles.resizer}
                                  paneStyle={splitPaneStyles.pane}
                                  pane1Style={
                                    isRightPanelHide
                                      ? {
                                          maxWidth: '100%',
                                          width: 'calc(100% - 10px)',
                                        }
                                      : { maxWidth: '80%' }
                                  }
                                  split="vertical"
                                  defaultSize={
                                    isRightPanelHide
                                      ? '99%'
                                      : 'calc(100% - 600px)'
                                  }
                                  minSize="80%"
                                  onDragFinished={handleSplitPanelDragFinished}
                                  onResizerDoubleClick={rightPanelHandler}
                                  onDragStarted={() => {
                                    setResizeEventStart(true);
                                  }}
                                >
                                  {displayerMode === DISPLAYER_MODE.DM_1D ? (
                                    <Viewer1D />
                                  ) : (
                                    <Viewer2D />
                                  )}
                                  {!isRightPanelHide ? (
                                    <Panels
                                      selectedTool={selectedTool}
                                      displayerMode={displayerMode}
                                    />
                                  ) : (
                                    <div />
                                  )}
                                </SplitPane>
                              </DropZone>
                            </div>
                            <div ref={elementsWraperRef} id="main-wrapper" />
                          </KeysListenerTracker>
                        </div>
                      </AssignmentProvider>
                    </HighlightProvider>
                  </ModalProvider>
                </ChartDataProvider>
              </DispatchProvider>
            </AlertProvider>
          </HelpProvider>
        </PreferencesProvider>
      </GlobalProvider>
    </ErrorBoundary>
  );
}

NMRDisplayer.propTypes = {
  docsBaseUrl: PropTypes.string,
  onDataChange: PropTypes.func,
  preferences: PropTypes.shape({
    general: PropTypes.shape({
      disableMultipletAnalysis: PropTypes.bool,
      hideSetSumFromMolecule: PropTypes.bool,
    }),
    panels: PropTypes.shape({
      hideSpectraPanel: PropTypes.bool,
      hideInformationPanel: PropTypes.bool,
      hidePeaksPanel: PropTypes.bool,
      hideIntegralsPanel: PropTypes.bool,
      hideRangesPanel: PropTypes.bool,
      hideStructuresPanel: PropTypes.bool,
      hideFiltersPanel: PropTypes.bool,
    }),
    toolBarButtons: PropTypes.shape({
      hideZoomTool: PropTypes.bool,
      hideZoomOutTool: PropTypes.bool,
      hideImport: PropTypes.bool,
      hideExportAs: PropTypes.bool,
      hideSpectraStackAlignments: PropTypes.bool,
      hideSpectraCenterAlignments: PropTypes.bool,
      hideRealImaginary: PropTypes.bool,
      hidePeakTool: PropTypes.bool,
      hideIntegralTool: PropTypes.bool,
      hideAutoRangesTool: PropTypes.bool,
      hideZeroFillingTool: PropTypes.bool,
      hidePhaseCorrectionTool: PropTypes.bool,
      hideBaseLineCorrectionTool: PropTypes.bool,
      hideFFTTool: PropTypes.bool,
    }),
  }),
};

NMRDisplayer.defaultProps = {
  docsBaseUrl: 'https://cheminfo.github.io/nmr-displayer/docs/v0',
  onDataChange: () => null,
  preferences: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
    },

    panels: {
      hideSpectraPanel: false,
      hideInformationPanel: false,
      hidePeaksPanel: false,
      hideIntegralsPanel: false,
      hideRangesPanel: false,
      hideStructuresPanel: false,
      hideFiltersPanel: false,
      hideZonesPanel: false,
      hideSummaryPanel: false,
      hideMultipleSpectraAnalysisPanel: false,
    },

    toolBarButtons: {
      hideZoomTool: false,
      hideZoomOutTool: false,
      hideImport: false,
      hideExportAs: false,
      hideSpectraStackAlignments: false,
      hideSpectraCenterAlignments: false,
      hideRealImaginary: false,
      hidePeakTool: false,
      hideIntegralTool: false,
      hideAutoRangesTool: false,
      hideZeroFillingTool: false,
      hidePhaseCorrectionTool: false,
      hideBaseLineCorrectionTool: false,
      hideFFTTool: false,
      hideMultipleSpectraAnalysisTool: false,
    },
  },
};

export default memo(NMRDisplayer);

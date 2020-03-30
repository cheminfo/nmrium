/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import {
  useEffect,
  useCallback,
  useReducer,
  useState,
  useMemo,
  useRef,
} from 'react';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import SplitPane from 'react-split-pane';
import { useToggle, useFullscreen } from 'react-use';
import 'cheminfo-font/dist/style.css';
import PropTypes from 'prop-types';

import { Analysis } from '../data/Analysis';

import Viewer1D from './1d/Viewer1D';
import Viewer2D from './2d/Viewer2D';
import ErrorBoundary from './ErrorBoundary';
import KeyListener from './EventsTrackers/keysListener';
import { ChartDataProvider } from './context/ChartContext';
import { DispatchProvider } from './context/DispatchContext';
import { ModalProvider } from './elements/Modal';
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
import { getXScale, getYScale } from './reducer/core/scale';
import { INITIATE, SET_WIDTH, SET_LOADING_FLAG } from './reducer/types/Types';
import ToolBar from './toolbar/ToolBar';

// alert optional cofiguration
const alertOptions = {
  position: positions.BOTTOM_CENTER,
  timeout: 5000,
  offset: '30px',
  transition: transitions.SCALE,
  containerStyle: { fontSize: '18px' },
};

const splitPaneStyles = {
  container: {
    position: 'relative',
    height: 'none',
  },
  pane1: { maxWidth: '80%', minWidth: '50%' },
  resizer: {
    width: 10,
    backgroundColor: '#f7f7f7',
    cursor: 'ew-resize',
  },
  pane: { overflow: 'hidden' },
};

const NMRDisplayer = (props) => {
  const {
    data: dataProp,
    height: heightProp,
    width: widthProps,
    preferences,
  } = props;
  const fullScreenRef = useRef();
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(fullScreenRef, show, {
    onClose: () => {
      toggle(false);
    },
  });

  const [isResizeEventStart, setResizeEventStart] = useState(false);

  const [state, dispatch] = useReducer(spectrumReducer, initialState);

  const { selectedTool, displayerMode } = state;

  useEffect(() => {
    dispatch({ type: SET_LOADING_FLAG, isLoading: true });
    Analysis.build(dataProp || {}).then((object) => {
      dispatch({ type: INITIATE, data: { AnalysisObj: object } });
    });
  }, [dataProp]);

  const scaleX = useCallback(
    (spectrumId = null) => getXScale(spectrumId, state),
    [state],
  );

  const scaleY = useMemo(() => {
    return (spectrumId = null, heightProps = null, isReverse = false) =>
      getYScale(spectrumId, heightProps, isReverse, state);
  }, [state]);

  const handleSplitPanelDragFinished = useCallback((size) => {
    setResizeEventStart(false);
    dispatch({ type: SET_WIDTH, width: size });
  }, []);
  const dispatchMiddleWare = useMemo(() => dispatchMiddleware(dispatch), [
    dispatch,
  ]);

  return (
    <ErrorBoundary>
      <ModalProvider>
        <AlertProvider template={AlertTemplate} {...alertOptions}>
          <DispatchProvider value={dispatchMiddleWare}>
            <ChartDataProvider
              value={{
                height: heightProp,
                width: widthProps,
                ...state,
                scaleX,
                scaleY,
                isResizeEventStart,
              }}
            >
              <KeyListener parentRef={fullScreenRef} />
              <HighlightProvider>
                <div
                  ref={fullScreenRef}
                  css={css`
                    background-color: white;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    div:focus {
                      outline: none !important;
                    }
                    button:active,
                    button:hover,
                    button:focus,
                    [type='button']:focus,
                    button {
                      outline: none !important;
                    }
                  `}
                >
                  <Header isFullscreen={isFullscreen} onMaximize={toggle} />
                  {/* ref={containerRef} */}
                  <div style={{ flex: 1 }}>
                    <DropZone>
                      <ToolBar preferences={preferences} />
                      <SplitPane
                        style={splitPaneStyles.container}
                        paneStyle={splitPaneStyles.pane}
                        resizerStyle={splitPaneStyles.resizer}
                        pane1Style={splitPaneStyles.pane1}
                        split="vertical"
                        defaultSize="80%"
                        minSize="80%"
                        onDragFinished={handleSplitPanelDragFinished}
                        onDragStarted={() => {
                          setResizeEventStart(true);
                        }}
                      >
                        {displayerMode === DISPLAYER_MODE.DM_1D ? (
                          <Viewer1D />
                        ) : (
                          <Viewer2D />
                        )}

                        <Panels
                          preferences={preferences}
                          selectedTool={selectedTool}
                        />
                      </SplitPane>
                    </DropZone>
                  </div>
                </div>
              </HighlightProvider>
            </ChartDataProvider>
          </DispatchProvider>
        </AlertProvider>
      </ModalProvider>
    </ErrorBoundary>
  );
};

NMRDisplayer.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  preferences: PropTypes.shape({
    panels: PropTypes.shape({
      hideSpectraPanel: PropTypes.bool,
      hideInformationPanel: PropTypes.bool,
      hidePeaksPanel: PropTypes.bool,
      hideIntegralsPanel: PropTypes.bool,
      hideRangesPanel: PropTypes.bool,
      hideStructuresPanel: PropTypes.bool,
      hideFiltersPanel: PropTypes.bool,
    }),
    toolsBarButtons: PropTypes.shape({
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
  height: 600,
  width: 800,
  preferences: {
    panels: {
      hideSpectraPanel: false,
      hideInformationPanel: false,
      hidePeaksPanel: false,
      hideIntegralsPanel: false,
      hideRangesPanel: false,
      hideStructuresPanel: false,
      hideFiltersPanel: false,
    },
  },
};

export default NMRDisplayer;

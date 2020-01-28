/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import * as d3 from 'd3';
import {
  useEffect,
  useCallback,
  useReducer,
  useState,
  useMemo,
  useRef,
  Fragment,
} from 'react';
import SplitPane from 'react-split-pane';
import { useSize, useDebounce, useToggle, useFullscreen } from 'react-use';
import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import 'cheminfo-font/dist/style.css';

import { Analysis } from '../data/Analysis';

import { HighlightProvider } from './highlight';
import { ChartDataProvider, useChartData } from './context/ChartContext';
import { spectrumReducer, initialState } from './reducer/Reducer';
import {
  INITIATE,
  SET_WIDTH,
  SET_DIMENSIONS,
  BRUSH_END,
  SET_ZOOM_FACTOR,
  ADD_INTEGRAL,
  ADD_PEAK,
  CHANGE_INTEGRAL_ZOOM,
  ADD_PEAKS,
  SET_VERTICAL_INDICATOR_X_POSITION,
  SET_LOADING_FLAG,
  FULL_ZOOM_OUT,
  ADD_BASE_LINE_ZONE,
} from './reducer/Actions';
import { DispatchProvider, useDispatch } from './context/DispatchContext';
import DropZone from './loader/DropZone';
import ToolBar from './toolbar/ToolBar';
import Panels from './panels/Panels';
import NMRChart from './1d/NMRChart';
import { MouseTracker } from './EventsTrackers/MouseTracker';
import CrossLinePointer from './tool/CrossLinePointer';
import { BrushTracker } from './EventsTrackers/BrushTracker';
import BrushX from './tool/BrushX';
import XLabelPointer from './tool/XLabelPointer';
import { options } from './toolbar/ToolTypes';
import PeakPointer from './tool/PeakPointer';
import Header from './header/Header';
import VerticalIndicator from './tool/VerticalIndicator';
import Spinner from './loader/Spinner';
import { ModalProvider } from './elements/Modal';
import KeyListener from './EventsTrackers/keysListener';

// alert optional cofiguration
const alertOptions = {
  position: positions.BOTTOM_CENTER,
  timeout: 3000,
  offset: '30px',
  transition: transitions.SCALE,
};

const splitPaneStyles = {
  container: {
    position: 'relative',
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
  const { data: dataProp, height: heightProp, width: widthProps } = props;
  const fullScreenRef = useRef();
  const containerRef = useRef();
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(fullScreenRef, show, {
    onClose: () => {
      toggle(false);
    },
  });

  useEffect(() => {
    if (isFullscreen) {
      setTimeout(() => {
        dispatch({
          type: SET_DIMENSIONS,
          height: window.innerHeight - 40,
        });
      }, 100);
    } else {
      dispatch({
        type: SET_DIMENSIONS,
        height: heightProp,
      });
    }
  }, [heightProp, isFullscreen]);

  const [isResizeEventStart, setResizeEventStart] = useState(false);

  const [state, dispatch] = useReducer(spectrumReducer, initialState);

  const {
    data,
    xDomain,
    yDomain,
    width,
    height,
    activeSpectrum,
    yDomains,
    mode,
    margin,
    verticalAlign,
    activeTab,
  } = state;

  useEffect(() => {
    dispatch({ type: SET_LOADING_FLAG, isLoading: true });
    Analysis.build(dataProp || {}).then((object) => {
      dispatch({ type: INITIATE, data: { AnalysisObj: object } });
    });
  }, [dataProp]);

  const filterSpectrumsByNucleus = useCallback(() => {
    if (activeTab) {
      return data.filter((d) => d.info.nucleus === activeTab);
    }
    return data;
  }, [activeTab, data]);

  const getScale = useMemo(() => {
    return (spectrumId = null) => {
      const _height =
        verticalAlign.flag && !verticalAlign.stacked ? height / 2 : height;

      const range =
        mode === 'RTL'
          ? [width - margin.right, margin.left]
          : [margin.left, width - margin.right];
      const x = d3.scaleLinear(xDomain, range);
      let y;
      if (spectrumId == null && yDomain !== undefined) {
        y = d3.scaleLinear(
          [0, yDomain[1]],
          [_height - margin.bottom, margin.top],
        );
      } else if (activeSpectrum == null || activeSpectrum.id !== spectrumId) {
        const index = filterSpectrumsByNucleus().findIndex(
          (d) => d.id === spectrumId,
        );
        y = d3.scaleLinear(
          [0, yDomains[index][1]],
          [_height - margin.bottom, margin.top],
        );
      } else {
        const index = filterSpectrumsByNucleus().findIndex(
          (d) => d.id === activeSpectrum.id,
        );
        y = d3.scaleLinear(
          [0, yDomains[index][1]],
          [_height - margin.bottom, margin.top],
        );
      }
      return { x, y };
    };
  }, [
    verticalAlign.flag,
    verticalAlign.stacked,
    height,
    mode,
    width,
    margin.right,
    margin.left,
    margin.bottom,
    margin.top,
    xDomain,
    yDomain,
    activeSpectrum,
    filterSpectrumsByNucleus,
    yDomains,
  ]);

  const handleSplitPanelDragFinished = useCallback((size) => {
    setResizeEventStart(false);
    dispatch({ type: SET_WIDTH, width: size });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (containerRef.current) {
        dispatch({
          type: SET_DIMENSIONS,
          height: containerRef.current.getBoundingClientRect().height,
        });
      }
    });
  }, []);

  useEffect(() => {
    dispatch({
      type: SET_DIMENSIONS,
      height: containerRef.current.getBoundingClientRect().height,
    });
  }, [containerRef]);

  return (
    <ModalProvider>
      <AlertProvider template={AlertTemplate} {...alertOptions}>
        <DispatchProvider value={dispatch}>
          <ChartDataProvider
            value={{
              height: heightProp,
              width: widthProps,
              ...state,
              getScale,
              isResizeEventStart,
            }}
          >
            <KeyListener />
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
                <div style={{ flex: 1 }} ref={containerRef}>
                  <DropZone>
                    <ToolBar />
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
                      <ChartPanel tools={!isResizeEventStart} />

                      <Panels />
                    </SplitPane>
                  </DropZone>
                </div>
              </div>
            </HighlightProvider>
          </ChartDataProvider>
        </DispatchProvider>
      </AlertProvider>
    </ModalProvider>
  );
};

function ChartPanel() {
  const { selectedTool, isLoading, data } = useChartData();
  const dispatch = useDispatch();

  const handelBrushEnd = useCallback(
    (brushData) => {
      switch (selectedTool) {
        case options.integral.id:
          dispatch({
            type: ADD_INTEGRAL,
            ...brushData,
          });
          break;

        case options.peakPicking.id:
          dispatch({
            type: ADD_PEAKS,
            ...brushData,
          });
          break;
        case options.baseLineCorrection.id:
          // console.log(brushData);
          dispatch({
            type: ADD_BASE_LINE_ZONE,
            zone: { from: brushData.startX, to: brushData.endX },
          });
          break;

        default:
          dispatch({ type: BRUSH_END, ...brushData });

          return;
      }
    },
    [dispatch, selectedTool],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({ type: FULL_ZOOM_OUT });
  }, [dispatch]);

  const handleZoom = useCallback(
    (event) => {
      switch (selectedTool) {
        case options.integral.id:
          dispatch({ type: CHANGE_INTEGRAL_ZOOM, zoomFactor: event });
          break;

        default:
          dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: event });

          return;
      }
    },
    [dispatch, selectedTool],
  );

  const mouseClick = useCallback(
    (position) => {
      if (selectedTool === options.peakPicking.id) {
        dispatch({
          type: ADD_PEAK,
          mouseCoordinates: position,
        });
      } else if (selectedTool === options.phaseCorrection.id) {
        dispatch({
          type: SET_VERTICAL_INDICATOR_X_POSITION,
          position: position.x,
        });
      }
    },
    [dispatch, selectedTool],
  );

  const [sizedNMRChart, { width, height }] = useSize(() => {
    return (
      <Fragment>
        <Spinner isLoading={isLoading} />

        {data && data.length > 0 && (
          <BrushTracker
            onBrush={handelBrushEnd}
            onDoubleClick={handelOnDoubleClick}
            onClick={mouseClick}
            onZoom={handleZoom}
            style={{
              width: '100%',
              height: `100%`,
              margin: 'auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MouseTracker style={{ width: '100%', height: `100%` }}>
              <NMRChart />
              <CrossLinePointer />
              <BrushX />
              <XLabelPointer />
              <PeakPointer />
              <VerticalIndicator />
            </MouseTracker>
          </BrushTracker>
        )}
      </Fragment>
    );
  }, []);
  const [finalSize, setFinalSize] = useState();

  useDebounce(() => setFinalSize({ width, height }), 400, [width, height]);
  useEffect(() => {
    if (finalSize) {
      dispatch({
        type: SET_DIMENSIONS,
        ...finalSize,
      });
    }
  }, [dispatch, finalSize]);

  return sizedNMRChart;
}

NMRDisplayer.defaultProps = {
  height: '600',
  width: '800',
};

export default NMRDisplayer;

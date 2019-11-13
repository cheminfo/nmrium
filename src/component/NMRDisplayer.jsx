import * as d3 from 'd3';
import React, {
  useEffect,
  useCallback,
  useReducer,
  useState,
  useMemo,
  useRef,
} from 'react';
import { useSize, useDebounce, useToggle, useFullscreen } from 'react-use';
import SplitPane from 'react-split-pane';

import './css/spectrum-chart.css';
import 'cheminfo-font/dist/style.css';

import { ChartDataProvider, useChartData } from './context/ChartContext';
import { spectrumReducer, initialState } from './reducer/Reducer';
import {
  INITIATE,
  SET_WIDTH,
  SET_DIMENSIONS,
  BRUSH_END,
  RESET_DOMAIN,
  SET_ZOOM_FACTOR,
  ADD_INTEGRAL,
  ADD_PEAK,
  CHANGE_INTEGRAL_ZOOM,
  ADD_PEAKS,
  SET_VERTICAL_INDICATOR_X_POSITION,
} from './reducer/Actions';
import { DispatchProvider, useDispatch } from './context/DispatchContext';
import DropZone from './DropZone';
import ToolBar from './toolbar/ToolBar';
import Panels from './panels/Panels';
import NMRChart from './NMRChart';
import { MouseTracker } from './EventsTrackers/MouseTracker';
import CrossLinePointer from './tool/CrossLinePointer';
import { BrushTracker } from './EventsTrackers/BrushTracker';
import BrushX from './tool/BrushX';
import XLabelPointer from './tool/XLabelPointer';
import { options } from './toolbar/ToolTypes';
import PeakPointer from './tool/PeakPointer';
import Header from './header/Header';
import VerticalIndicator from './tool/VerticalIndicator';

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
  } = state;

  useEffect(() => {
    if (dataProp) {
      dispatch({ type: INITIATE, data: { AnalysisObj: dataProp } });
    }
  }, [dataProp]);

  const getScale = useMemo(() => {
    return (spectrumId = null) => {
      const range =
        mode === 'RTL'
          ? [width - margin.right, margin.left]
          : [margin.left, width - margin.right];

      const x = d3.scaleLinear(xDomain, range);
      let y;
      if (spectrumId == null) {
        y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
      } else if (activeSpectrum == null || activeSpectrum.id !== spectrumId) {
        const index = data.findIndex((d) => d.id === spectrumId);
        y = d3.scaleLinear(yDomains[index], [
          height - margin.bottom,
          margin.top,
        ]);
      } else {
        const index = data.findIndex((d) => d.id === activeSpectrum.id);
        y = d3.scaleLinear(yDomains[index], [
          height - margin.bottom,
          margin.top,
        ]);
      }
      return { x, y };
    };
  }, [
    activeSpectrum,
    data,
    mode,
    width,
    xDomain,
    yDomain,
    yDomains,
    height,
    margin,
  ]);

  const handleSplitPanelDragFinished = useCallback((size) => {
    setResizeEventStart(false);
    dispatch({ type: SET_WIDTH, width: size });
  }, []);

  useEffect(() => {
    dispatch({
      type: SET_DIMENSIONS,
      height: containerRef.current.getBoundingClientRect().height,
    });
  }, [containerRef]);

  return (
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
        <div
          ref={fullScreenRef}
          style={{
            backgroundColor: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Header isFullscreen={isFullscreen} onMaximize={toggle} />
          <div style={{ flex: 1 }} ref={containerRef}>
            <DropZone>
              <ToolBar />
              <SplitPane
                paneStyle={{ overflow: 'hidden' }}
                className="split-container"
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
      </ChartDataProvider>
    </DispatchProvider>
  );
};

function ChartPanel() {
  const { selectedTool, height: _height } = useChartData();
  const dispatch = useDispatch();

  const handelBrushEnd = useCallback(
    (brushData) => {
      switch (selectedTool) {
        case options.zoom.id:
          dispatch({ type: BRUSH_END, ...brushData });
          break;

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

        default:
          return;
      }
    },
    [dispatch, selectedTool],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({ type: RESET_DOMAIN });
  }, [dispatch]);

  const handleZoom = useCallback(
    (event) => {
      switch (selectedTool) {
        case options.zoom.id:
          dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: event });
          break;

        case options.integral.id:
          dispatch({ type: CHANGE_INTEGRAL_ZOOM, zoomFactor: event });

          break;
        default:
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
      } else if (selectedTool === options.equalizerTool.id) {
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
      <BrushTracker
        onBrush={handelBrushEnd}
        onDoubleClick={handelOnDoubleClick}
        onClick={mouseClick}
        onZoom={handleZoom}
        style={{
          width: '100%',
          height: `${_height}px`,
          margin: 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MouseTracker style={{ width: '100%', height: `${_height}px` }}>
          <NMRChart />
          <CrossLinePointer />
          <BrushX />
          <XLabelPointer />
          <PeakPointer />
          <VerticalIndicator />
        </MouseTracker>
      </BrushTracker>
    );
  }, [_height]);
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

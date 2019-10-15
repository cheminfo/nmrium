import * as d3 from 'd3';
import React, {
  useEffect,
  useCallback,
  useReducer,
  useState,
  useMemo,
} from 'react';
import { useSize, useDebounce } from 'react-use';
import SplitPane from 'react-split-pane';

import './css/spectrum-chart.css';
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
  CHNAGE_INTEGRAL_ZOOM,
  ADD_PEAKS,
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
import { options } from './toolbar/FunctionToolBar';
import PeakPointer from './tool/PeakPointer';

const NMRDisplayer = (props) => {
  const { data: dataProp } = props;
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

  return (
    <DispatchProvider value={dispatch}>
      <ChartDataProvider
        value={{
          ...state,
          getScale,
          isResizeEventStart,
        }}
      >
        <div style={{ backgroundColor: 'white' }}>
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
      </ChartDataProvider>
    </DispatchProvider>
  );
};

function ChartPanel() {
  const { selectedTool } = useChartData();
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

  const handelOnDoubleClick = useCallback(
    (event) => {
      dispatch({ type: RESET_DOMAIN });
    },
    [dispatch],
  );

  const handleZoom = useCallback(
    (event) => {
      switch (selectedTool) {
        case options.zoom.id:
          dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: event });
          break;

        case options.integral.id:
          dispatch({ type: CHNAGE_INTEGRAL_ZOOM, zoomFactor: event });

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
          height: '400px',
          margin: 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MouseTracker style={{ width: '100%', height: '400px' }}>
          <NMRChart />
          <CrossLinePointer />
          <BrushX />
          <XLabelPointer />
          <PeakPointer />
        </MouseTracker>
      </BrushTracker>
    );
  });
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

export default NMRDisplayer;

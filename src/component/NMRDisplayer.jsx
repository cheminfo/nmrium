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
import { ChartDataProvider } from './context/ChartContext';
import { spectrumReducer, initialState } from './reducer/Reducer';
import {
  INITIATE,
  SET_WIDTH,
  SET_DIMENSIONS,
  BRUSH_END,
  RESET_DOMAIN,
} from './reducer/Actions';
import { DispatchProvider, useDispatch } from './context/DispatchContext';
import DropZone from './DropZone';
import ToolBar from './toolbar/ToolBar';
import Panels from './panels/Panels';
// import Tools from './tool/Tools';
import NMRChart from './NMRChart';
import { MouseTracker } from './EventsTrackers/MouseTracker';
import CrossLinePointer from './tool/CrossLinePointer';
import { BrushTracker } from './EventsTrackers/BrushTracker';
import BrushX from './tool/BrushX';
import XLabelPointer from './tool/XLabelPointer';

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
  const [sizedNMRChart, { width, height }] = useSize(() => {
    // const { width, height } = useChartData();

    const handelBrushEnd = (brushData) => {
      console.log(brushData);
      dispatch({ type: BRUSH_END, ...brushData });
    };

    const handelOnDoubleClick = (event) => {
      dispatch({ type: RESET_DOMAIN });
      console.log(event);
    };

    return (
      // <Div style={{ width: '100%', height: '400px' }}>
      <BrushTracker
        onBrush={handelBrushEnd}
        onDoubleClick={handelOnDoubleClick}
        style={{
          width: '100%',
          height: '400px',
          margin: 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MouseTracker style={{ width: '100%', height: '400px' }}>
          <CrossLinePointer />
          <BrushX />
          <XLabelPointer />
          <NMRChart />
        </MouseTracker>
      </BrushTracker>
      // </div>
    );
  });
  const dispatch = useDispatch();
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

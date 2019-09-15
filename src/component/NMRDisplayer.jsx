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
import { spectrumReducer } from './reducer/Reducer';
import { INITIATE, SET_WIDTH, SET_DIMENSIONS } from './reducer/Actions';
import { DispatchProvider, useDispatch } from './context/DispatchContext';
import DropZone from './DropZone';
import ToolBar from './toolbar/ToolBar';
import { options } from './toolbar/FunctionToolBar';
import Panels from './panels/Panels';
import Tools from './tool/Tools';
import { DimensionProvider } from './context/DimensionsContext';
import NMRChart from './NMRChart';

const NMRDisplayer = ({
  margin: marginProp,
  width: widthProp,
  height: heightProp,
  data: dataProp,
  mode: modeProp,
}) => {
  const [isResizeEventStart, setResizeEventStart] = useState(false);

  const initialState = {
    data: [],
    xDomain: [],
    yDomain: [],
    yDomains: [],
    originDomain: {},
    selectedTool: options.zoom.id,
    peakNotations: [],
    width: widthProp,
    height: heightProp,
    margin: marginProp,
    activeSpectrum: null,
    mode: modeProp,
    zoomFactor: {},
    molecules: [],
    verticalAlign: 0,
  };

  const [state, dispatch] = useReducer(spectrumReducer, {
    ...initialState,
    history: {
      past: [],
      present: null,
      future: [],
      hasUndo: false,
      hasRedo: false,
    },
  });

  const {
    data,
    xDomain,
    yDomain,
    width,
    height,
    activeSpectrum,
    yDomains,
    mode,
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
          ? [width - marginProp.right, marginProp.left]
          : [marginProp.left, width - marginProp.right];

      const x = d3.scaleLinear(xDomain, range);
      let y;
      if (spectrumId == null) {
        y = d3.scaleLinear(yDomain, [
          height - marginProp.bottom,
          marginProp.top,
        ]);
      } else if (activeSpectrum == null || activeSpectrum.id !== spectrumId) {
        const index = data.findIndex((d) => d.id === spectrumId);
        y = d3.scaleLinear(yDomains[index], [
          height - marginProp.bottom,
          marginProp.top,
        ]);
      } else {
        const index = data.findIndex((d) => d.id === activeSpectrum.id);
        y = d3.scaleLinear(yDomains[index], [
          height - marginProp.bottom,
          marginProp.top,
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
    marginProp,
  ]);

  const handleSplitPanelDragFinished = useCallback((size) => {
    setResizeEventStart(false);
    dispatch({ type: SET_WIDTH, width: size });
  }, []);

  return (
    <DispatchProvider value={dispatch}>
      <DimensionProvider
        value={{ margin: marginProp, width: width, height: height }}
      >
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
      </DimensionProvider>
    </DispatchProvider>
  );
};

function ChartPanel({ tools = true }) {
  const [sizedNMRChart, { width, height }] = useSize(() => {
    return (
      <div style={{ width: '100%' }}>
        <NMRChart />
      </div>
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

  return (
    <div>
      {sizedNMRChart}
      <Tools disabled={!tools} />
    </div>
  );
}

NMRDisplayer.defaultProps = {
  width: 800,
  height: 800,
  data: null,
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  mode: 'RTL',
};

export default NMRDisplayer;

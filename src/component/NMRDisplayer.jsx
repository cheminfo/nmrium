import * as d3 from 'd3';
import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import './css/spectrum-chart.css';
import { useFullscreen, useToggle } from 'react-use';
import SplitPane from 'react-split-pane';
import { FaRegWindowMaximize } from 'react-icons/fa';

import { Analysis } from '../data/Analysis';

import YAxis from './YAxis';
import XAxis from './XAxis';
import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import { ChartDataProvider } from './context/ChartContext';
import { spectrumReducer } from './reducer/Reducer';
import { INITIATE, SET_WIDTH, SET_DIMENSIONS } from './reducer/Actions';
import { DispatchProvider } from './context/DispatchContext';
import DropZone from './DropZone';
import ToolBar from './toolbar/ToolBar';
import { options } from './toolbar/FunctionToolBar';
import Panels from './panels/Panels';
import Tools from './tool/Tools';
import { DimensionProvider } from './context/DimensionsContext';

const NMRDisplayer = ({
  margin: marginProp,
  width: widthProp,
  height: heightProp,
  data: dataProp,
  mode: modeProp,
}) => {
  const refSVG = useRef();
  const refChartPanel = useRef();
  const fullScreenRef = useRef();

  const [chartDiemensions, setChartDimensions] = useState({});
  const [isResizeEventStart, setResizeEventStart] = useState(false);

  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(fullScreenRef, show, {
    onClose: () => {
      toggle(false);
      setTimeout(() => {
        dispatch({
          type: SET_DIMENSIONS,
          width: refChartPanel.current.clientWidth,
          height: chartDiemensions.height,
        });
      }, 100);
    },
  });

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
    integrals,
    mode,
  } = state;

  useEffect(() => {
    function handleResize() {
      if (isFullscreen) {
        setTimeout(() => {
          dispatch({
            type: SET_DIMENSIONS,
            width: refChartPanel.current.clientWidth,
            height: window.innerHeight - marginProp.bottom,
          });
        }, 100);
      } else {
        setTimeout(() => {
          dispatch({
            type: SET_DIMENSIONS,
            width: refChartPanel.current.clientWidth,
            height: chartDiemensions.height,
          });
        }, 100);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [chartDiemensions, heightProp, widthProp, isFullscreen, marginProp]);

  useEffect(() => {
    if (dataProp) {
      dispatch({ type: INITIATE, data: { AnalysisObj: dataProp } });
    }
  }, [dataProp]);

  useLayoutEffect(() => {
    setChartDimensions({
      width: refChartPanel.current.clientWidth,
      height: refChartPanel.current.clientHeight,
    });
  }, [dataProp]);

  useEffect(() => {
    dispatch({ type: SET_WIDTH, width: refChartPanel.current.clientWidth });
  }, [widthProp, heightProp]);

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

  const handleSpiltPanelSizeChanged = useCallback((size) => {
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
          <div ref={fullScreenRef} style={{ backgroundColor: 'white' }}>
            <div className="header-toolbar">
              {!isFullscreen ? (
                <button type="button" onClick={toggle}>
                  <FaRegWindowMaximize />
                </button>
              ) : (
                ''
              )}
            </div>
            <DropZone>
              <ToolBar />
              <SplitPane
                className="split-container"
                split="vertical"
                defaultSize="80%"
                minSize="80%"
                onDragFinished={handleSpiltPanelSizeChanged}
                onDragStarted={() => {
                  setResizeEventStart(true);
                }}
              >
                <div ref={refChartPanel}>
                  <svg ref={refSVG} width={width} height={height}>
                    <defs>
                      <clipPath id="clip">
                        <rect
                          width={`${width -
                            marginProp.left -
                            marginProp.right}`}
                          height={`${height}`}
                          x={`${marginProp.left}`}
                          y={`${marginProp.top}`}
                        />
                      </clipPath>
                    </defs>

                    <LinesSeries data={data} />
                    <IntegralsSeries data={data} integrals={integrals} />

                    <g className="container">
                      <XAxis showGrid={true} mode={mode} />
                      <YAxis label="PPM" show={false} />
                    </g>
                  </svg>
                  <Tools />
                </div>
                <Panels />
              </SplitPane>
            </DropZone>
          </div>
        </ChartDataProvider>
      </DimensionProvider>
    </DispatchProvider>
  );
};

NMRDisplayer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.objectOf(Analysis),
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  mode: PropTypes.oneOf(['RTL', 'LTR']),
};

NMRDisplayer.defaultProps = {
  width: 800,
  height: 800,
  data: null,
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  mode: 'RTL',
};

export default NMRDisplayer;

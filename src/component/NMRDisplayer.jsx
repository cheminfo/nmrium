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
import {
  INITIATE,
  SET_WIDTH,
  PEAK_PICKING,
  SET_DIMENSIONS,
} from './reducer/Actions';
import { DispatchProvider } from './context/DispatchContext';
import DropZone from './DropZone';
import ToolBar from './toolbar/ToolBar';
import { options } from './toolbar/FunctionToolBar';
import Panels from './panels/Panels';
import Tools from './tool/Tools';
import { DimensionProvider } from './context/DimensionsContext';

const NMRDisplayer = ({ margin, width, height, data, mode }) => {
  const refSVG = useRef();
  const refChartPanel = useRef();
  const fullScreenRef = useRef();

  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
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
    _data: [],
    _xDomain: [],
    _yDomain: [],
    _yDomains: [],
    _originDomain: {},
    _selectedTool: options.zoom.id,
    _peakNotations: [],
    _width: width,
    _height: height,
    _margin: margin,
    _activeSpectrum: null,
    _mode: mode,
    _zoomFactor: {},
    _molecules: [],
    verticalAlign: 0,
  };

  const _history = {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  };

  const [state, dispatch] = useReducer(spectrumReducer, {
    ...initialState,
    history: _history,
  });

  const {
    _data,
    _xDomain,
    _yDomain,
    _originDomain,
    _selectedTool,
    _width,
    _height,
    _activeSpectrum,
    _yDomains,
    _integrals,
    _mode,
    _zoomFactor,
    _molecules,
    verticalAlign,
    history,
  } = state;

  useEffect(() => {
    function handleResize() {
      if (isFullscreen) {
        setTimeout(() => {
          dispatch({
            type: SET_DIMENSIONS,
            width: refChartPanel.current.clientWidth,
            height: window.innerHeight - margin.bottom,
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
  }, [chartDiemensions, height, width, isFullscreen, margin]);

  useEffect(() => {
    if (data) {
      dispatch({ type: INITIATE, data: { AnalysisObj: data } });
    }
  }, [data]);

  useLayoutEffect(() => {
    setChartDimensions({
      width: refChartPanel.current.clientWidth,
      height: refChartPanel.current.clientHeight,
    });
  }, [data]);

  useEffect(() => {
    dispatch({ type: SET_WIDTH, width: refChartPanel.current.clientWidth });
  }, [width, height]);

  const mouseMove = useCallback((e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const x = e.clientX - refChartPanel.current.getBoundingClientRect().left;
    const y = e.clientY - refChartPanel.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      setMouseCoordinates({ x, y });
    }, 60);
  }, []);

  const mouseMoveLeave = useCallback(() => {
    setMouseCoordinates({ x: 0, y: 0 });
  }, []);

  const getScale = useMemo(() => {
    return (spectrumId = null) => {
      const range =
        _mode === 'RTL'
          ? [_width - margin.right, margin.left]
          : [margin.left, _width - margin.right];

      const x = d3.scaleLinear(_xDomain, range);
      let y;
      if (spectrumId == null) {
        y = d3.scaleLinear(_yDomain, [_height - margin.bottom, margin.top]);
      } else if (_activeSpectrum == null || _activeSpectrum.id !== spectrumId) {
        const index = _data.findIndex((d) => d.id === spectrumId);
        y = d3.scaleLinear(_yDomains[index], [
          _height - margin.bottom,
          margin.top,
        ]);
      } else {
        const index = _data.findIndex((d) => d.id === _activeSpectrum.id);
        y = d3.scaleLinear(_yDomains[index], [
          _height - margin.bottom,
          margin.top,
        ]);
      }
      return { x, y };
    };
  }, [
    _activeSpectrum,
    _data,
    _mode,
    _width,
    _xDomain,
    _yDomain,
    _yDomains,
    _height,
    margin,
  ]);

  const mouseClick = () => {
    if (_selectedTool === options.peakPicking.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCoordinates,
      });
    }
  };

  const handleSpiltPanelSizeChanged = useCallback((size) => {
    setResizeEventStart(false);
    dispatch({ type: SET_WIDTH, width: size });
  }, []);

  return (
    <DispatchProvider value={dispatch}>
      <DimensionProvider
        value={{ margin: margin, width: _width, height: _height }}
      >
        <ChartDataProvider
          value={{
            data: _data,
            xDomain: _xDomain,
            yDomain: _yDomain,
            getScale: getScale,
            activeSpectrum: _activeSpectrum,
            verticalAlign: verticalAlign,
            mode: _mode,
            zoomFactor: _zoomFactor,
            history: history,
            molecules: _molecules,
            originDomain: _originDomain,
          }}
        >
          <div ref={fullScreenRef} style={{ backgroundColor: 'white' }}>
            <div className="header-toolbar">
              {!isFullscreen ? (
                <button onClick={toggle}>
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
                  <svg
                    onMouseMove={isResizeEventStart ? null : mouseMove}
                    ref={refSVG}
                    onMouseLeave={mouseMoveLeave}
                    onClick={mouseClick}
                    width={_width}
                    height={_height}
                  >
                    <defs>
                      <clipPath id="clip">
                      {/* - margin.top - margin.bottom */}
                        <rect
                          width={`${_width - margin.left - margin.right}`}
                          height={`${_height}`}
                          x={`${margin.left}`}
                          y={`${margin.top}`}
                        />
                      </clipPath>
                    </defs>

                    <LinesSeries data={_data} />
                    <IntegralsSeries data={_data} integrals={_integrals} />
                    <g className="container">
                      <XAxis showGrid={true} mode={_mode} />
                      <YAxis label="PPM" show={false} />
                      <Tools
                        selectedTool={_selectedTool}
                        mouseCoordinates={mouseCoordinates}
                      />
                    </g>
                  </svg>
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

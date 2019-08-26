import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
  Fragment,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Grid from '@material-ui/core/Grid';
import PublishRounded from '@material-ui/icons/PublishRounded';
import { useDropzone } from 'react-dropzone';
import { Snackbar } from '@material-ui/core';

import './css/spectrum-chart.css';
import FunctionToolBar, { options } from './toolbar/FunctionToolBar';
import ViewButton from './toolbar/ViewButton';
import YAxis from './YAxis';
import XAxis from './XAxis';
import BrushTool from './tool/BrushTool';
import CrossLinePointer from './tool/CrossLinePointer';

import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import PeakNotationTool from './tool/PeakNotationTool';
import { ChartContext } from './context/ChartContext';
import { spectrumReducer } from './reducer/Reducer';

import SpectrumList from './toolbar/SpectrumList';
import SnackbarContentWrapper, { MESSAGE_TYPE } from './SnackBarContentWraper';


import { Analysis } from '../data/Analysis';

import {
  INITIATE,
  SET_WIDTH,
  PEAK_PICKING,
  LOADING_SPECTRUM,
  SET_DATA,
  FULL_ZOOM_OUT,
  ADD_INTEGRAL,
} from './reducer/Actions';

import BasicToolBar from './toolbar/BasicToolBar';
import HistoryToolBar from './toolbar/HistoryToolBar';
import IntegralTool from './tool/IntegralTool';
import InformationPanel from './toolbar/InformationPanel';
import IntegralTable from './toolbar/IntegralTable';
import { DispatchProvider } from './context/DispatchContext';
import ZoomTool from './tool/ZoomTool';

function loadFiles(acceptedFiles) {
  
  return Promise.all(
    [].map.call(acceptedFiles, (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (
          !(
            file.name.endsWith('.dx') ||
            file.name.endsWith('.jdx') ||
            file.name.endsWith('.json')
          )
        ) {
          reject('The file must be jcamp file .dx,.jdx,.json file extention');
        } else {
          reader.onabort = (e) => reject('file reading was aborted', e);
          reader.onerror = (e) => reject('file reading has failed', e);
          reader.onload = () => {
            if (reader.result) {
              const binary = reader.result;

              const name = file.name.substr(0, file.name.lastIndexOf('.'));
              const extension = file.name.substr(
                file.name.lastIndexOf('.'),
                file.name.length,
              );
              resolve({ binary, name, extension });
            }
          };
          reader.readAsBinaryString(file);
        }
      });
    }),
  );
}

const SpectrumChart = ({ margin, width, height, data, mode }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const [message, openMessage] = useState({
    isOpen: false,
    messageText: '',
    messageType: MESSAGE_TYPE.success,
  });
  const [verticalAlign, setVerticalAlign] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    loadFiles(acceptedFiles).then(
      (files) => {
        dispatch({ type: LOADING_SPECTRUM, files });
      },
      (err) => {
        alert(err);
      },
    );
  }, []);

  const refSVG = useRef();
  const chartArea = useRef();

  const initialState = {
    _data: data,
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
    _zoomFactor:{},
    openMessage: handelOpenMessage,
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
    _peakNotations,
    _width,
    _activeSpectrum,
    _yDomains,
    history,
    _integrals,
    _mode,
    _zoomFactor,
  } = state;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const infoList = useMemo(
    () => [
      {
        id: 'spectraPanel',
        title: 'spectra',
        component: <SpectrumList data={_data} />,
      },
      {
        id: 'informationPanel',
        title: 'Information',
        component: <p>information</p>,
      },
      {
        id: 'integralsPanel',
        title: 'Integrals',
        component: (
          <IntegralTable data={_data} activeSpectrum={_activeSpectrum} />
        ),
      },
      {
        id: 'peaksPanel',
        title: 'Peaks',
        component: <p>Peaks</p>,
      },
      {
        id: 'structuresPanel',
        title: 'Structures',
        component: <p>Structures</p>,
      },
    ],
    [_activeSpectrum, _data],
  );

  useEffect(() => {
    const AnalysisObj = new Analysis();
    dispatch({ type: INITIATE, data: { AnalysisObj } });
  }, []);

  useEffect(() => {
    dispatch({ type: SET_DATA, data });
  }, [data]);

  useEffect(() => {
    dispatch({ type: SET_WIDTH, width: chartArea.current.clientWidth });
  }, [width, height]);

  const mouseMove = useCallback((e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const x = e.clientX - chartArea.current.getBoundingClientRect().left;
    const y = e.clientY - chartArea.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      setMouseCoordinates({ x, y });
    }, 60);
  }, []);

  const mouseMoveLeave = useCallback((e) => {
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
        y = d3.scaleLinear(_yDomain, [height - margin.bottom, margin.top]);
      } else if (_activeSpectrum == null || _activeSpectrum.id !== spectrumId) {
        const index = _data.findIndex((d) => d.id === spectrumId);
        y = d3.scaleLinear(_yDomains[index], [
          height - margin.bottom,
          margin.top,
        ]);
      } else {
        const index = _data.findIndex((d) => d.id === _activeSpectrum.id);
        y = d3.scaleLinear(_yDomains[index], [
          height - margin.bottom,
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
    height,
    margin,
  ]);

  const mouseClick = (e) => {
    if (_selectedTool === options.peakPicking.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCoordinates,
      });
    }
  };

  const handleAddIntegral = useCallback((integral) => {
    dispatch({
      type: ADD_INTEGRAL,
      integral,
    });
  }, []);

  const handleFullZoomOut = useCallback((e) => {
    dispatch({
      type: FULL_ZOOM_OUT,
    });
  }, []);

  function handelOpenMessage({ messageType, messageText }) {
    openMessage({ messageType, messageText, isOpen: true });
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    openMessage({ ...message, isOpen: false });
  }

  // const handleChangeVerticalAlignments = () => {
  //   if (verticalAlign !== 0) {
  //     setVerticalAlign(0);
  //   } else {
  //     setVerticalAlign(Math.floor(-height / (_data.length + 2)));
  //   }
  // };

  const handleChangeVerticalAlignments = useCallback(() => {
    if (verticalAlign !== 0) {
      setVerticalAlign(0);
    } else {
      setVerticalAlign(Math.floor(-height / (_data.length + 2)));
    }
  }, [verticalAlign, _data, height]);

  return (
    <DispatchProvider value={dispatch}>
      <ChartContext.Provider
        value={{
          margin: margin,
          width: _width,
          height: height,
          data: _data,
          xDomain: _xDomain,
          yDomain: _yDomain,
          getScale: getScale,
          activeSpectrum: _activeSpectrum,
          openMessage: handelOpenMessage,
          verticalAlign: verticalAlign,
          mode: _mode,
          zoomFactor:_zoomFactor
        }}
      >
        <div
          {...getRootProps()}
          className={isDragActive ? 'main-container over' : 'main-container'}
          style={{ width: `${width}px` }}
        >
          <input {...getInputProps()} />
          {isDragActive && (
            <div
              className="drop-zoon-over"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              <PublishRounded />
              <p>Drop your files here</p>
            </div>
          )}
          <Grid container spacing={0}>
            <Grid item xs={1} className="toolbar-container">
              <FunctionToolBar
                defaultValue={options.zoom.id}
                data={_data}
                activeSpectrum={_activeSpectrum}
              />
              <HistoryToolBar history={history} />
              <BasicToolBar
                onFullZoomOut={handleFullZoomOut}
                onViewChanged={handleChangeVerticalAlignments}
                viewAlignValue={verticalAlign}
                data={_data}
                activeSpectrum={_activeSpectrum}
              />

              <ViewButton
                defaultValue={true}
                data={_data}
                activeSpectrum={_activeSpectrum}
              />
            </Grid>

            <Grid ref={chartArea} item xs={8}>
              <svg
                onMouseMove={mouseMove}
                ref={refSVG}
                onMouseLeave={mouseMoveLeave}
                onClick={mouseClick}
                width={_width}
                height={height}
              >
                {_xDomain && _yDomain && (
                  <Fragment>
                    <LinesSeries data={_data} />
                    <IntegralsSeries data={_data} integrals={_integrals} />
                  </Fragment>
                )}

                <g className="container">
                  <XAxis showGrid={true} mode={_mode} />

                  <YAxis label="PPM" show={false} />
                  {_selectedTool === options.zoom.id && (
                    <Fragment>
                      <CrossLinePointer
                        position={mouseCoordinates}
                        margin={margin}
                        width={width}
                        height={height}
                      />
                      {/* <ZoomTool  margin={margin}
                        width={_width}
                        height={height}
                        domain={{ x: _xDomain, y: _yDomain }}
                        originDomain={_originDomain}
                        isActive={true}
                        getScale={getScale}
                        mode={_mode}
                        /> */}
                      <BrushTool
                        margin={margin}
                        width={_width}
                        height={height}
                        domain={{ x: _xDomain, y: _yDomain }}
                        originDomain={_originDomain}
                        isActive={true}
                        getScale={getScale}
                        mode={_mode}
                      />
                    </Fragment>
                  )}

                  {_selectedTool === options.integral.id && (
                    <IntegralTool
                      margin={margin}
                      width={_width}
                      height={height}
                      data={_data}
                      domain={{ x: _xDomain, y: _yDomain }}
                      isActive={true}
                      getScale={getScale}
                      position={mouseCoordinates}
                      activeSpectrum={_activeSpectrum}
                      mode={_mode}
                      onIntegralDrawFinished={handleAddIntegral}
                    />
                  )}

                  {(_selectedTool === options.peakPicking.id ||
                    _peakNotations) && (
                    <PeakNotationTool
                      position={mouseCoordinates}
                      showCursorLabel={_selectedTool === options.peakPicking.id}
                    />
                  )}
                </g>
              </svg>
            </Grid>

            <Grid item xs={3}>
              <InformationPanel activeItem="spectraPanel" listItem={infoList} />
            </Grid>
          </Grid>

          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={message.isOpen}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <SnackbarContentWrapper
              onClose={handleClose}
              variant={message.messageType}
              message={message.messageText}
            />
          </Snackbar>
        </div>
      </ChartContext.Provider>
    </DispatchProvider>
  );
};

SpectrumChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  mode: PropTypes.oneOf(['RTL', 'LTR']),
};

SpectrumChart.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  mode: 'RTL',
};

export default SpectrumChart;

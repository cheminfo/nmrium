import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
  Fragment,
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
import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
import PeakNotationTool from './tool/PeakNotationTool';
import { ChartContext } from './context/ChartContext';
import { spectrumReducer } from './reducer/Reducer';

import SpectrumList from './toolbar/SpectrumList';
import SnackbarContentWrapper, { MESSAGE_TYPE } from './SnackBarContentWraper';

import {
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_SELECTED_TOOL,
  PEAK_PICKING,
  LOADING_SPECTRUM,
  SET_DATA,
  SHIFT_SPECTRUM,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
  CHNAGE_SPECTRUM_COLOR,
  DELETE_PEAK_NOTATION,
  ADD_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
} from './reducer/Actions';

import { UNDO, REDO } from './reducer/HistoryActions';
import BasicToolBar from './toolbar/BasicToolBar';
import HistoryToolBar from './toolbar/HistoryToolBar';
import IntegralTool from './tool/IntegralTool';
import InformationPanel from './toolbar/InformationPanel';
import IntegralTable from './toolbar/IntegralTable';

const SpectrumChart = ({ margin, width, height, data, mode }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const [message, openMessage] = useState({
    isOpen: false,
    messageText: '',
    messageType: MESSAGE_TYPE.success,
  });
  const [verticalAlign, setVerticalAlign] = useState(0);

  const LoadFiles = (acceptedFiles) => {
    return Promise.all(
      [].map.call(acceptedFiles, (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          if (!(file.name.endsWith('.dx') || file.name.endsWith('.jdx'))) {
            reject('The file must be jcamp file .dx,.jdx file extention');
          } else {
            reader.onabort = (e) => reject('file reading was aborted', e);
            reader.onerror = (e) => reject('file reading has failed', e);
            reader.onload = () => {
              if (reader.result) {
                const binaryData = reader.result;

                const name = file.name.substr(0, file.name.lastIndexOf('.'));
                resolve({ binary: binaryData, name: name });
              }
            };

            reader.readAsBinaryString(file);
          }
        });
      }),
    );
  };

  const onDrop = useCallback((acceptedFiles) => {
    LoadFiles(acceptedFiles).then(
      (files) => {
        console.log(files);
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
  } = state;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const infoList = [
    {
      id: 'spectraPanel',
      title: 'spectra',
      component: (
        <SpectrumList
          data={_data}
          onChangeVisibility={handleChangeVisibility}
          onChangeActive={handleChangeActiveSpectrum}
          onColorChanged={handleSpectrumColorChanged}
          onChangeMarkersVisibility={handleChangeMarkersVisibility}
        />
      ),
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
  ];

  useEffect(() => {
    console.log(data);
    dispatch({ type: SET_DATA, data });
  }, [data]);

  useEffect(() => {
    dispatch({ type: SET_WIDTH, width: chartArea.current.clientWidth });
  }, [width, height]);

  const handleChangeOption = (selectedTool) => {
    dispatch({ type: SET_SELECTED_TOOL, selectedTool });
  };

  const handleShowSpectrumTypeChang = (isRealSpectrumVisible) => {
    dispatch({ type: TOGGLE_REAL_IMAGINARY_VISIBILITY, isRealSpectrumVisible });
  };

  const handleXDomainUpdate = (xDomain) => {
    dispatch({ type: SET_X_DOMAIN, xDomain });
  };

  const handleYDomainUpdate = (yDomain) => {
    dispatch({ type: SET_Y_DOMAIN, yDomain });
  };

  const handleRestDomain = (domain) => {
    dispatch({ type: SET_X_DOMAIN, xDomain: domain.x });
    dispatch({ type: SET_Y_DOMAIN, yDomain: domain.y });
  };

  const mouseMove = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const x = e.clientX - chartArea.current.getBoundingClientRect().left;
    const y = e.clientY - chartArea.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      setMouseCoordinates({ x, y });
    }, 60);
  };

  const mouseMoveLeave = (e) => {
    setMouseCoordinates({ x: 0, y: 0 });
  };

  const getScale = (spectrumId = null) => {
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

  const handleOnPeakChange = (e) => {
    dispatch({ type: SHIFT_SPECTRUM, shiftValue: e.shiftValue });
  };

  const handleDeleteNotation = (data) => {
    dispatch({ type: DELETE_PEAK_NOTATION, data });
  };

  const mouseClick = (e) => {
    if (_selectedTool === options.peakPicking.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCoordinates,
      });
    }
  };

  const handleAddIntegral = (integral) => {
    dispatch({
      type: ADD_INTEGRAL,
      integral,
    });
  };

  const handleRedo = (e) => {
    dispatch({
      type: REDO,
    });
  };

  const handleUndo = (e) => {
    dispatch({
      type: UNDO,
    });
  };

  const handleFullZoomOut = (e) => {
    dispatch({
      type: FULL_ZOOM_OUT,
    });
  };

  function handleChangeVisibility(data) {
    dispatch({ type: CHANGE_VISIBILITY, data });
  }

  function handleChangeMarkersVisibility(data) {
    dispatch({ type: CHANGE_PEAKS_MARKERS_VISIBILITY, data });
  }

  function handleChangeActiveSpectrum(data) {
    dispatch({ type: CHNAGE_ACTIVE_SPECTRUM, data });
  }

  function handleSpectrumColorChanged(data) {
    dispatch({ type: CHNAGE_SPECTRUM_COLOR, data });
  }

  function handelOpenMessage({ messageType, messageText }) {
    openMessage({ messageType, messageText, isOpen: true });
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    openMessage({ ...message, isOpen: false });
  }

  const handleChangeVerticalAlignments = () => {
    if (verticalAlign !== 0) {
      setVerticalAlign(0);
    } else {
      setVerticalAlign(Math.floor(-height / (_data.length + 2)));
    }
  };

  return (
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
              onChangeOption={handleChangeOption}
              defaultValue={options.zoom.id}
              data={_data}
              activeSpectrum={_activeSpectrum}
            />
            <HistoryToolBar
              history={history}
              onRedo={handleRedo}
              onUndo={handleUndo}
            />
            <BasicToolBar
              onFullZoomOut={handleFullZoomOut}
              onViewChanged={handleChangeVerticalAlignments}
              viewAlignValue={verticalAlign}
              data={_data}
              activeSpectrum={_activeSpectrum}
            />

            <ViewButton
              onChange={handleShowSpectrumTypeChang}
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
                  <BrushTool
                    onDomainReset={handleRestDomain}
                    onXAxisDomainUpdate={handleXDomainUpdate}
                    onYAxisDomainUpdate={handleYDomainUpdate}
                    margin={margin}
                    width={_width}
                    height={height}
                    data={_data}
                    domain={{ x: _xDomain, y: _yDomain }}
                    originDomain={_originDomain}
                    isActive={true}
                    getScale={getScale}
                    position={mouseCoordinates}
                    mode={_mode}
                  />
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
                    notationData={_peakNotations}
                    onPeakValueChange={handleOnPeakChange}
                    position={mouseCoordinates}
                    showCursorLabel={_selectedTool === options.peakPicking.id}
                    onDeleteNotation={handleDeleteNotation}
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

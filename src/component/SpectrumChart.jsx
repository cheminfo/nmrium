import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
  Fragment,
} from 'react';
import './css/spectrum-chart.css';
import PropTypes from 'prop-types';
import FunctionToolBar, { options } from './toolbar/FunctionToolBar';
import ViewButton from './toolbar/ViewButton';

import YAxis from './YAxis';
import XAxis from './XAxis';
import BrushTool from './tool/BrushTool';
import LinesSeries from './LinesSeries';
import IntegralsSeries from './IntegralsSeries';
// import CrossLinePointer from './tool/CrossLinePointer';
import * as d3 from 'd3';
import PeakNotationTool from './tool/PeakNotationTool';
import Grid from '@material-ui/core/Grid';
import { ChartContext } from './context/ChartContext';
import { useDropzone } from 'react-dropzone';
import PublishRounded from '@material-ui/icons/PublishRounded';
import { spectrumReducer } from './reducer/Reducer';
// import Button from '@material-ui/core/Button';
// import Tooltip from '@material-ui/core/Tooltip';
// import { FaUndo, FaRedo, FaSearchMinus, FaMinus, FaBars } from 'react-icons/fa';

import SpectrumList from './toolbar/SpectrumList';
import { Snackbar } from '@material-ui/core';
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
  // CHANGE_SPECTRUM_TYPE,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHANGE_PEAKS_MARKERS_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
  CHNAGE_SPECTRUM_COLOR,
  DELETE_PEAK_NOTATION,
  ADD_INTEGRAL,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
} from './reducer/Actions';

import { UNDO, REDO, RESET } from './reducer/HistoryActions';
import BasicToolBar from './toolbar/BasicToolBar';
import HistoryToolBar from './toolbar/HistoryToolBar';
import IntegralTool from './tool/IntegralTool';
import InformationPanel from './toolbar/InformationPanel';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
// }));

const SpectrumChart = ({ margin, width, height, data, mode }) => {
  const [mouseCoordinates, setMouseCoordinates] = useState({ x: 0, y: 0 });
  const [message, openMessage] = useState({
    isOpen: false,
    messageText: '',
    messageType: MESSAGE_TYPE.success,
  });
  const [verticalAlign, setVerticalAlign] = useState(0);

  const LoadFiles = (acceptedFiles) => {
    //   return Promise.all([].map.call(files, function (file) {
    //     return new Promise(function (resolve, reject) {
    //         var reader = new FileReader();
    //         reader.onloadend = function () {
    //             resolve({ result: reader.result, file: file });
    //         };
    //         reader.readAsArrayBuffer(file);
    //     });
    // }))
    return Promise.all(
      [].map.call(acceptedFiles, (file) => {
        return new Promise((resolve, reject) => {
          // acceptedFiles.forEach((file) => {
          const reader = new FileReader();

          if (!(file.name.endsWith('.dx') || file.name.endsWith('.jdx'))) {
            reject('The file must be jcamp file .dx,.jdx file extention');
          } else {
            reader.onabort = (e) => reject('file reading was aborted', e);
            reader.onerror = (e) => reject('file reading has failed', e);
            reader.onload = () => {
              // Do whatever you want with the file contents
              if (reader.result) {
                const binaryData = reader.result;

                const name = file.name.substr(0, file.name.lastIndexOf('.'));
                // filesReader.push({ binary: binaryData, name: name });
                resolve({ binary: binaryData, name: name });
              }
            };

            reader.readAsBinaryString(file);
            // console.log(filesReader)
          }
        });
      }),
    );
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the file
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
    _integrals: [],
    _mode: mode,
    openMessage: handelOpenMessage,
  };

  // const reduers = combineReducers({spectrumReducer,historyReducer});
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



  useEffect(() => {
    dispatch({ type: SET_DATA, data });
  }, [data]);

  useEffect(() => {
    // const domain = getDomain(_data);
    dispatch({ type: SET_WIDTH, width: chartArea.current.clientWidth });
  }, [width, height]);

  const handleChangeOption = (selectedTool) => {
    dispatch({ type: SET_SELECTED_TOOL, selectedTool });
  };

  const handleShowSpectrumTypeChang = (isRealSpectrumVisible) => {
    dispatch({ type: TOGGLE_REAL_IMAGINARY_VISIBILITY, isRealSpectrumVisible });
  };

  /**
   * get Domain for x axis and y axis
   * @param {array} data
   */
  // function getDomain(data = []) {
  //   let xArray = [];
  //   let yArray = [];

  //   for (let d of data) {
  //     xArray = xArray.concat(d['x']);
  //     yArray = yArray.concat(d['y']);
  //   }
  //   return { x: d3.extent(xArray), y: d3.extent(yArray) };
  // }

  // function getDomain(data) {
  //   console.log(data);
  //   return { x: [data.x[0], data.x[data.x.length - 1]], y: d3.extent(data.y) };
  // }

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
    // e.stopPropagation();
    // e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const x = e.clientX - chartArea.current.getBoundingClientRect().left;
    const y = e.clientY - chartArea.current.getBoundingClientRect().top;

    // const x = e.clientX - refSVG.current.getBoundingClientRect().left;
    // const y = e.clientY - refSVG.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      //   dispatch({
      //     type: SET_POINTER_COORDINATES,
      //     pointerCorrdinates: { x, y },
      //   });
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
    // console.log(spectrumId);
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
    //activat selected peak tool
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

  function handleChangeVisibility (data) {
    dispatch({ type: CHANGE_VISIBILITY, data });
  };

  function handleChangeMarkersVisibility (data){
    dispatch({ type: CHANGE_PEAKS_MARKERS_VISIBILITY, data });
  };

  function handleChangeActiveSpectrum  (data) {
    dispatch({ type: CHNAGE_ACTIVE_SPECTRUM, data });
  };

  function handleSpectrumColorChanged  (data) {
    dispatch({ type: CHNAGE_SPECTRUM_COLOR, data });
  };

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
        // className={classes.root}
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

        {/* className={isDragActive?'drop-zoon-blur':''} */}
        <Grid container spacing={0}>
          <Grid item xs={1} className="toolbar-container">
            <FunctionToolBar
              onChangeOption={handleChangeOption}
              defaultValue={options.zoom.id}
              data={_data}
              activeSpectrum={_activeSpectrum}

              // toolbarWidth={(w) => {
              //   setToolbarWidth(w);
              // }}
            />

            {/* <Tooltip title="Redo" placement="right-start">

              <Button
                className="general-fun-bt"
                onClick={handleRedo}
                disabled={!state.history.hasRedo}
              >
                <FaRedo />
              </Button>
            </Tooltip>

            <Tooltip title="Undo" placement="right-start">
              <Button
                className="general-fun-bt"
                onClick={handleUndo}
                disabled={!state.history.hasUndo}
              >
                <FaUndo />
              </Button>
            </Tooltip>

            <Tooltip title="Full Zoom Out" placement="right-start">
              <Button className="general-fun-bt" onClick={handleFullZoomOut}>
                <FaSearchMinus />
              </Button>
            </Tooltip>
            <Tooltip title="Spectrums  alignment " placement="right-start">
              <Button
                className="general-fun-bt"
                onClick={handleChangeVerticalAlignments}
              >
                {verticalAlign !== 0 ? <FaMinus /> : <FaBars />}
              </Button>
            </Tooltip> */}
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
                // _data.map((d, i) => (
                <Fragment>
                  <LinesSeries
                    // margin={margin}
                    // width={width - toolbarWidth}
                    // height={height}
                    // key={d.id}
                    data={_data}
                    // xDomain={_xDomain}
                    // yDomain={_yDomain}
                    // getScale={getScale}
                  />

                  <IntegralsSeries data={_data} integrals={_integrals} />
                </Fragment>
              )
              // ))
              }

              <g className="container">
                {/* isFID={true} */}
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
                    // data={_data}
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
            <InformationPanel
              activeItem="spectraPanel"
              listItem={[
                {
                  id:'spectraPanel',
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
                  id:'informationPanel',
                  title: 'Information',
                  component: (<p>information</p>)
                },
                {
                  id:'integralsPanel',
                  title: 'Integrals',
                  component:  (<p>Integrals</p>)
                },
                {
                  id:'peaksPanel',
                  title: 'Peaks',
                  component:  (<p>Peaks</p>)
                },
                {
                  id:'structuresPanel',
                  title: 'Structures',
                  component:  (<p>Structures</p>)
                },
              ]}
            />
            {/* {_data && _data[0] && (
              <SpectrumList
                data={_data}
                onChangeVisibility={handleChangeVisibility}
                onChangeActive={handleChangeActiveSpectrum}
                onColorChanged={handleSpectrumColorChanged}
                onChangeMarkersVisibility={handleChangeMarkersVisibility}
              />
            )} */}
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

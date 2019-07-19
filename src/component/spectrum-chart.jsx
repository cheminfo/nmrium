import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useState,
} from 'react';
import './css/spectrum-chart.css';
import PropTypes from 'prop-types';
import ToolBarPane, { options } from './toolbar-pane';
import ShowToolBar from './show-toolbar';

import YAxis from './axis-y';
import XAxis from './axis-x';
import BrushTool from './tool/brush-tool';
import Lines from './lines';
// import ZoomTool from './tool/zoom-tool';
import CrossLineCursorTool from './tool/cross-line-tool';
import * as d3 from 'd3';
import PeakNotaion from './tool/peak-notation-tool';
// import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { ChartContext } from './context/chart-context';
import { useDropzone } from 'react-dropzone';
import PublishRounded from '@material-ui/icons/PublishRounded';
// import { spectrumReducer } from './reducer/reducer';
// import { historyReducer } from './reducer/undo-reducer';
import combineReducers from './reducer/combine-reducers';
import { spectrumReducer } from './reducer/reducer';
import { historyReducer } from './reducer/undo-reducer';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaUndo, FaRedo, FaSearchMinus } from 'react-icons/fa';

import SpectrumList from './spectrum-list';
import { Snackbar } from '@material-ui/core';
import SnackbarContentWrapper,{MESSAGE_TYPE} from './snack-bar-content-wraper';



import {
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
  PEAK_PICKING,
  LOADING_SPECTRUM,
  SET_DATA,
  SHIFT_SPECTRUM,
  CHANGE_SPECTRUM_TYPE,
  FULL_ZOOM_OUT,
  CHANGE_VISIBILITY,
  CHNAGE_ACTIVE_SPECTRUM,
} from './reducer/action';

import { UNDO, REDO, RESET } from './reducer/undo-action';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
// }));

const SpectrumChart = ({ margin, width, height, data }) => {
  const [mouseCorrdinates, setMouseCorrdinates] = useState({ x: 0, y: 0 });
  const [message, openMessage] = React.useState({isOpen:false,messageText:"",messageType:MESSAGE_TYPE.success});
   


  const LoadFile = (acceptedFiles) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      acceptedFiles.forEach((file) => {
        if (!file.name.endsWith('.dx')) {
          reject('The file must be jcamp file .dx file extention');
        } else {
          reader.readAsBinaryString(file);
        }
      });

      reader.onabort = (e) => reject('file reading was aborted', e);
      reader.onerror = (e) => reject('file reading has failed', e);
      reader.onload = () => {
        // Do whatever you want with the file contents
        console.log(reader);

        if (reader.result) {
          const binaryData = reader.result;

          const name =acceptedFiles[0].name.substr(0,acceptedFiles[0].name.lastIndexOf("."));
          resolve({binary:binaryData,name:name});
        }
      };

      console.log(acceptedFiles);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the file
    LoadFile(acceptedFiles).then(
      (file) => {
        dispatch({ type: LOADING_SPECTRUM, ...file });
      },
      (err) => {
        alert(err);
      },
    );
  }, []);

  const refSVG = useRef();
  const chartArea = useRef();

  const intialState = {
    _data: [],
    _xDomain: [],
    _yDomain: [],
    _orignDomain: {},
    _selectedTool: options.zoom.id,
    _isRealSpectrumVisible: true,
    _peakNotations: [],
    _width: width,
    _height: height,
    _margin: margin,
    _activeSpectrum: null,
    openMessage:handelOpenMessage
  };

  // const reduers = combineReducers({spectrumReducer,historyReducer});
  const history = {
    past: [],
    present: null,
    future: [],
    hasUndo: false,
    hasRedo: false,
  };

  const [state, dispatch] = useReducer(spectrumReducer, {
    ...intialState,
    history,
  });

  const {
    _data,
    _xDomain,
    _yDomain,
    _orignDomain,
    _selectedTool,
    _isRealSpectrumVisible,
    _peakNotations,
    _width,
    _activeSpectrum,
  } = state;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // onDrop,
    onDrop,
    noClick: true,
  });
  useEffect(() => {
    dispatch({ type: SET_DATA, data });
  }, []);

  useEffect(() => {
    // const domain = getDomain(_data);
    dispatch({ type: SET_WIDTH, width: chartArea.current.clientWidth });
  }, [width, height]);

  const handleChangeOption = (selectedTool) => {
    // setSelectedTool(selectedTool);
    dispatch({ type: SET_SELECTED_TOOL, selectedTool });
  };

  const handleShowSpectrumTypeChang = (isRealSpectrumVisible) => {
    dispatch({ type: CHANGE_SPECTRUM_TYPE, isRealSpectrumVisible });
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


      const x = e.clientX - refSVG.current.getBoundingClientRect().left;
    const y = e.clientY - refSVG.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      //   dispatch({
      //     type: SET_POINTER_COORDINATES,
      //     pointerCorrdinates: { x, y },
      //   });
      setMouseCorrdinates( { x, y });
    });
  };

  const getScale = () => {
    // console.log(_xDomain);
    // console.log(_yDomain);
    const x = d3.scaleLinear(_xDomain, [_width - margin.right, margin.left]);
    const y = d3.scaleLinear(_yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };

  const handleOnPeakChange = (e) => {
    dispatch({ type: SHIFT_SPECTRUM, shiftValue: e.shiftValue });
  };

  const mouseClick = (e) => {
    //activat selected peak tool
    if (_selectedTool === options.peaktool.id) {
      dispatch({
        type: PEAK_PICKING,
        mouseCorrdinates
      });
    }
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

  const handlefFullZoomOut = (e) => {
    dispatch({
      type: FULL_ZOOM_OUT,
    });
  };

  const handleChangeVisibility = (data) => {
    dispatch({ type: CHANGE_VISIBILITY, data });
  };

  const handleChangeActiveSpectrum = (data) => {
    dispatch({ type: CHNAGE_ACTIVE_SPECTRUM, data });
  };

  function  handelOpenMessage({messageType,messageText}) {
    openMessage({messageType,messageText,isOpen:true});
  }

  function handleClose  (event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    openMessage({...message,isOpen:false});
  }


  

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
        openMessage:handelOpenMessage
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
            <p>Drop your file here</p>
          </div>
        )}

        {/* className={isDragActive?'drop-zoon-blur':''} */}
        <Grid container spacing={0}>
          <Grid item xs={1}>
            <ToolBarPane
              selectedValue={_selectedTool}
              onChangeOption={handleChangeOption}
              // toolbarWidth={(w) => {
              //   setToolbarWidth(w);
              // }}
            />

            <Tooltip title="Redo" placement="right-start">
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
              <Button className="general-fun-bt" onClick={handlefFullZoomOut}>
                <FaSearchMinus />
              </Button>
            </Tooltip>

            <ShowToolBar
              selectedValue={_isRealSpectrumVisible}
              onChangeOption={handleShowSpectrumTypeChang}
              defaultValue={true}
            />
          </Grid>

          <Grid ref={chartArea} item xs={8}>
            <svg
              ref={refSVG}
              onMouseMove={mouseMove}
              onClick={mouseClick}
              width={_width}
              height={height}
            >
              <CrossLineCursorTool
                position={mouseCorrdinates}
                margin={margin}
                width={_width}
                height={height}
              />

              {_xDomain && _yDomain && (
                // _data.map((d, i) => (
                <Lines
                  // margin={margin}
                  // width={width - toolbarWidth}
                  // height={height}
                  // key={d.id}
                  data={_data}
                  // xDomain={_xDomain}
                  // yDomain={_yDomain}
                  // getScale={getScale}
                />
              )
              // ))
              }

              <g className="container">
                <XAxis showGrid={true} isFID={true} />

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
                    originDomain={_orignDomain}
                    isActive={true}
                    getScale={getScale}
                  />
                )}
                {/* <ZoomTool
                  onXAxisDomainUpdate={handleXDomainUpdate}
                  margin={margin}
                  width={width - toolbarWidth}
                  height={height}
                  data={data}
                  domain={{ x: _xDomain, y: _yDomain }}
                  isActive={_toolOption.brush}
                  getScale={getScale}
                /> */}
              </g>

              <PeakNotaion
                // data={_data}
                notationData={_peakNotations}
                onPeakValueChange={handleOnPeakChange}
              />
            </svg>
          </Grid>

          <Grid item xs={3}>
            {_data && _data[0] && (
              <SpectrumList
                data={_data}
                onChangeVisibility={handleChangeVisibility}
                onChangeActive={handleChangeActiveSpectrum}
              />
            )}
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
};

SpectrumChart.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
};

export default SpectrumChart;

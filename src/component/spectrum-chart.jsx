import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
} from 'react';
import './css/spectrum-chart.css';
import PropTypes from 'prop-types';
import ToolBarPane, { options } from './toolbar-pane';
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
import { spectrumReducer } from './reducer/reducer';

import {
  SET_ORGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
  PEAK_PICKING,
  LOADING_SPECTRUM,
  SHIFT_SPECTRUM
} from './reducer/action';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
// }));

const SpectrumChart = ({ margin, width, height, data }) => {

  const LoadFile =  (acceptedFiles) => {
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
        if (reader.result) {
          const binaryData = reader.result;
          resolve(binaryData);

        }
      };

      console.log(acceptedFiles);
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the file
     LoadFile(acceptedFiles).then((binaryData)=>{
               dispatch({type:LOADING_SPECTRUM,binaryData});
    },(err)=>{

      alert(err)
    });

  }, []);

  const refSVG = useRef();
  const chartArea = useRef();

  const intialState = {
    _data: data,
    _xDomain: [],
    _yDomain: [],
    _orignDomain: {},
    _selectedTool: options.zoom.id,
    _pointerCorrdinates: { x: 0, y: 0 },
    _peakNotations: [],
    _width: width,
    _height: height,
    _margin: margin,
  };

  const [state, dispatch] = useReducer(spectrumReducer, intialState);
  const {
    _data,
    _xDomain,
    _yDomain,
    _orignDomain,
    _selectedTool,
    _pointerCorrdinates,
    _peakNotations,
    _width,
    _height,
    _margin,
  } = state;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // onDrop,
    onDrop,
    noClick: true,
  });

  useEffect(() => {

    const domain = getDomain(_data);
    dispatch({ type: SET_ORGINAL_DOMAIN, domain: domain });
    dispatch({ type: SET_X_DOMAIN, xDomain: domain.x });
    dispatch({ type: SET_Y_DOMAIN, yDomain: domain.y });
    dispatch({ type: SET_WIDTH, width: chartArea.current.clientWidth });

  }, [state._data, width, height]);

  const handleChangeOption = (selectedTool) => {
    // setSelectedTool(selectedTool);
    dispatch({ type: SET_SELECTED_TOOL, selectedTool });
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

  function getDomain(data) {
    console.log(data);
    return { x: [data.x[0], data.x[data.x.length - 1]], y: d3.extent(data.y) };
  }

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
    const x = e.clientX - refSVG.current.getBoundingClientRect().left;
    const y = e.clientY - refSVG.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      dispatch({
        type: SET_POINTER_COORDINATES,
        pointerCorrdinates: { x, y },
      });
    });
  };

  const getScale = () => {
    const x = d3.scaleLinear(_xDomain, [_width - margin.right, margin.left]);
    const y = d3.scaleLinear(_yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };


  const handleOnPeakChange = (e) => {
    dispatch({type:SHIFT_SPECTRUM,shiftValue:e.shiftValue})
  };

 
  const mouseClick = (e) => {
    //activat selected peak tool
    if (_selectedTool === options.peaktool.id) {
      dispatch({
        type: PEAK_PICKING,
      });
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
          <div className="drop-zoon-over" style={{ width: `${width}px` }}>
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
          </Grid>
          <Grid ref={chartArea} item xs={11}>
            <svg
              ref={refSVG}
              onMouseMove={mouseMove}
              onClick={mouseClick}
              width={_width}
              height={height}
            >
              <CrossLineCursorTool
                position={_pointerCorrdinates}
                margin={margin}
                width={_width}
                height={height}
              />

              {_xDomain && _yDomain && (
                <Lines
                // margin={margin}
                // width={width - toolbarWidth}
                // height={height}
                // data={data}
                // xDomain={_xDomain}
                // yDomain={_yDomain}
                // getScale={getScale}
                />
              )}

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
                notationData={_peakNotations}
                onPeakValueChange={handleOnPeakChange}
              />
            </svg>
          </Grid>
        </Grid>
      </div>
    </ChartContext.Provider>
  );
};

SpectrumChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object.isRequired,
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

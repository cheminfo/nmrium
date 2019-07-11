import React, {
  // useState,
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
import { Datum1D } from '../data/Datum1D';
import PublishRounded from '@material-ui/icons/PublishRounded';
import { spectrumReducer } from './reducer/reducer';

import {
  SET_ORGINAL_DOMAIN,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
  SET_WIDTH,
  SET_POINTER_COORDINATES,
  SET_SELECTED_TOOL,
} from './reducer/action';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
// }));

const SpectrumChart = ({ margin, width, height, data }) => {
  const onDrop = useCallback((acceptedFiles) => {});
  // const onDrop = useCallback((acceptedFiles) => {
  //   // Do something with the files
  //   const reader = new FileReader();
  //   acceptedFiles.forEach((file) => {
  //     if (!file.name.endsWith('.dx')) {
  //       alert('The file must be jcamp file .dx file extention');
  //     } else {
  //       reader.readAsBinaryString(file);
  //     }
  //   });

  //   reader.onabort = () => console.log('file reading was aborted');
  //   reader.onerror = () => console.log('file reading has failed');
  //   reader.onload = () => {
  //     // Do whatever you want with the file contents
  //     if (reader.result) {
  //       const fileStr = reader.result.toString();
  //       const spectrumData = Datum1D.fromJcamp(fileStr);
  //       console.log(_data);
  //       const v_data = { ..._data };
  //       v_data.x = spectrumData.x;
  //       v_data.y = spectrumData.im;
  //       console.log(v_data);
  //       setData(v_data);
  //       console.log();
  //     }
  //     // console.log(binaryStr)
  //   };

  //   console.log(acceptedFiles);
  // }, []);

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

  // const [_data, setData] = useState(data);
  // const [_xDomain, setXDomain] = useState([]);
  // const [_yDomain, setYDomain] = useState([]);
  // const [_orignDomain, setOriginDomain] = useState({});
  // const [_selectedTool, setSelectedTool] = useState(options.zoom.id);
  // // const [toolbarWidth, setToolbarWidth] = useState(0);
  // const [_rulersCoordinates, setRullerCoordinates] = useState({ x: 0, y: 0 });
  // const [_peakNotations, setPeakNotaions] = useState([]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // onDrop,
    onDrop,
    noClick: true,
  });
  // const [_width, setWidth] = useState(width);
  // const [_height, setHeight] = useState(height);
  // const [_margin, setMargin] = useState(margin);

  // function getStates(){

  //   return {
  //     _data,_xDomain,_yDomain,_orignDomain,_rulersCoordinates,_peakNotations,_width,_height,_margin
  //   }
  // }

  useEffect(() => {
    console.log(state)
    const domain = getDomain(_data);

    dispatch(state, { type: SET_ORGINAL_DOMAIN, domain: domain });
    dispatch(state, { type: SET_X_DOMAIN, xDomain: domain.x });
    dispatch(state, { type: SET_Y_DOMAIN, yDomain: domain.y });
    dispatch(state, { type: SET_WIDTH, width: chartArea.current.clientWidth });

    // setOriginDomain(domain);
    // setXDomain(domain.x);
    // setYDomain(domain.y);

    // console.log(domain);
    // setWidth(chartArea.current.clientWidth);
  }, [state._data, width, height]);

  // useEffect(()=>{

  //   // console.log();

  //   setWidth(chartArea.current.clientWidth);

  // },[]);

  const handleChangeOption = (selectedTool) => {
    // setSelectedTool(selectedTool);
    dispatch(state, { type: SET_SELECTED_TOOL, selectedTool });
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
    // setXDomain(xDomain);
    dispatch(state, { type: SET_X_DOMAIN, xDomain });
  };

  const handleYDomainUpdate = (yDomain) => {
    // setYDomain(yDomain);
    dispatch(state, { type: SET_Y_DOMAIN, yDomain });
  };

  const handleRestDomain = (domain) => {
    // setXDomain(domain.x);
    // setYDomain(domain.y);
    dispatch(state, { type: SET_X_DOMAIN, xDomain: domain.x });
    dispatch(state, { type: SET_Y_DOMAIN, yDomain: domain.y });
  };

  const mouseMove = (e) => {
    const x = e.clientX - refSVG.current.getBoundingClientRect().left;
    const y = e.clientY - refSVG.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      // setRullerCoordinates({ x: mousex, y: mousey });
      dispatch(state, {
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

  function getClosePeak(xShift = 5) {
    const scale = getScale();
    const zoon = [
      scale.x.invert(_pointerCorrdinates.x - xShift),
      scale.x.invert(_pointerCorrdinates.x + xShift),
    ];
    console.log(zoon);

    var maxIndex = _data.x.findIndex((number) => number >= zoon[0]) - 1;
    var minIndex = _data.x.findIndex((number) => number >= zoon[1]);

    const selctedYData = _data.y.slice(minIndex, maxIndex);

    const peakYValue = d3.max(selctedYData);
    const xIndex = selctedYData.findIndex((value) => value === peakYValue);
    const peakXValue = _data.x[minIndex + xIndex];

    return { x: peakXValue, y: peakYValue };
  }

  const handleAddPeak = (e) => {
    const peak = getClosePeak(10);
    const points = [..._peakNotations];

    if (
      _peakNotations.findIndex(
        (nelement) => nelement.id === peak.x.toString() + '-' + peak.y,
      ) == -1
    ) {
      points.push({
        x: peak.x,
        y: peak.y,
        id: peak.x.toString() + '-' + peak.y,
      });

      // points.push({
      //   x: scale.x.invert(rulersCoordinates.x),
      //   y: scale.y.invert(rulersCoordinates.y),
      //   id:scale.x.invert(rulersCoordinates.x).toString()+"-"+scale.y.invert(rulersCoordinates.y)
      // });

      // setPeakNotaions(points);
    }
  };

  const handleOnPeakChange = (e) => {
    // const _peakNotations = [...peakNotations];
    // const notificationInex = _peakNotations.findIndex(
    //   (item) => item.id === e.id,
    // );

    // _peakNotations[notificationInex].x = e.value;

    // // setXShift(e.shiftValue);
    // setPeakNotaions(_peakNotations);
    shiftXAxis(e.shiftValue);
  };

  function shiftXAxis(shiftValue, id) {
    const data = { ..._data };
    console.log(data);
    //shifting the x value of the data
    data.x = data.x.map((val) => val + shiftValue);
    //shifting the notation
    let ndata = [..._peakNotations];
    ndata = ndata.map((e) => {
      return { x: e.x + shiftValue, y: e.y, id: e.x + shiftValue + '-' + e.y };
    });

    // setPeakNotaions(ndata);
    // setData(data);
  }

  const mouseClick = (e) => {
    //activat selected peak tool
    if (_selectedTool === options.peaktool.id) {
      handleAddPeak(e);
    }
  };

  // const handleXAxisDidMount = (xDomain) => {
  //   // setXDomain(xDomain);
  //   // setOriginalXDomain(xDomain);
  // };

  // const handleYAxisDidMount = (yDomain) => {
  //   // setYDomain(yDomain);
  // };

  // const toggleMaximize = () => {
  //   setIsMaximized(!_isMaximized);
  //   if (_isMaximized) {
  //     setWindowPosition(null);

  //     setWidth(width);
  //     setHeight(height);
  //   } else {
  //     setWindowPosition({ x: 0, y: 0 });
  //     setWidth(window.innerWidth-5);
  //     setHeight(window.innerHeight-82);
  //   }
  // };

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

import React, { useState, useEffect, useRef } from 'react';
import './css/spectrum-chart.css';
import PropTypes from 'prop-types';
import ToolBarPane, { options } from './toolbar-pane';
import YAxis from './axis-y';
import XAxis from './axis-x';
import BrushTool from './tool/brush-tool';
import Lines from './lines';
import ZoomTool from './tool/zoom-tool';
import CrossLineCursorTool from './tool/cross-line-tool';
import * as d3 from 'd3';
import PeakNotaion from './tool/peak-notation-tool';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { ChartContext } from './chart-context';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

const SpectrumChart = ({ margin, width, height, data }) => {
  const refSVG = useRef();
  const refMain = useRef();

  const [_xDomain, setXDomain] = useState([]);
  const [_yDomain, setYDomain] = useState([]);
  const [_orignDomain, setOriginDomain] = useState({});
  const [_selectedTool, setSelectedTool] = useState(options.zoom.id);

  const [toolbarWidth, setToolbarWidth] = useState(0);
  const [rulersCoordinates, setRullerCoordinates] = useState({ x: 0, y: 0 });
  const [peakNotations, setPeakNotaions] = useState([]);

  const classes = useStyles();

  useEffect(() => {
    const domain = getDomain(data);
    setOriginDomain(domain);
    setXDomain(domain.x);
    setYDomain(domain.y);
  }, [width, height]);

  const handleChangeOption = (option) => {
    setSelectedTool(option);
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
    setXDomain(xDomain);
  };

  const handleYDomainUpdate = (yDomain) => {
    setYDomain(yDomain);
  };

  const handleRestDomain = (domain) => {
    setXDomain(domain.x);
    setYDomain(domain.y);
  };

  const mouseMove = (e) => {
    const mousex = e.pageX - refSVG.current.getBoundingClientRect().left;
    const mousey = e.pageY - refSVG.current.getBoundingClientRect().top;
    requestAnimationFrame(() => {
      setRullerCoordinates({ x: mousex, y: mousey });
    });
  };

  const getScale = () => {
    const x = d3.scaleLinear(_xDomain, [width - margin.right, margin.left]);
    const y = d3.scaleLinear(_yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };

  function getClosePeak(xShift = 5) {
    const scale = getScale();
    const zoon = [
      scale.x.invert(rulersCoordinates.x - xShift),
      scale.x.invert(rulersCoordinates.x + xShift),
    ];
    console.log(zoon);

    var maxIndex = data.x.findIndex((number) => number >= zoon[0]) - 1;
    var minIndex = data.x.findIndex((number) => number >= zoon[1]);

    const selctedYData = data.y.slice(minIndex, maxIndex);

    const peakYValue = d3.max(selctedYData);
    const xIndex = selctedYData.findIndex((value) => value === peakYValue);
    const peakXValue = data.x[minIndex + xIndex];

    return { x: peakXValue, y: peakYValue };
  }

  const handleAddPeak = (e) => {
    const peak = getClosePeak(10);
    const points = [...peakNotations];

    if (
      peakNotations.findIndex(
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
      setPeakNotaions(points);
    }
  };

  const handleOnPeakChange = (e) => {
    const _peakNotations = [...peakNotations];
    const notificationInex = _peakNotations.findIndex(
      (item) => item.id === e.id,
    );
    _peakNotations[notificationInex].x = parseFloat(e.value);
    setPeakNotaions(_peakNotations);
  };

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
        width: width - toolbarWidth,
        height: height,
        data: data,
        xDomain: _xDomain,
        yDomain: _yDomain,
        getScale: getScale,
      }}
    >
      <div
        className="main-container"
        className={classes.root}
        // style={{ width: `${width}px` }}
      >
        <Grid container spacing={0}>
          <Grid item xs={1}>
            <ToolBarPane
              selectedValue={_selectedTool}
              onChangeOption={handleChangeOption}
              toolbarWidth={(w) => {
                setToolbarWidth(w);
              }}
            />
          </Grid>
          <Grid ref={refMain} item xs={11}>
            <svg
              ref={refSVG}
              onMouseMove={mouseMove}
              onClick={mouseClick}
              width={width - toolbarWidth}
              height={height}
            >
              <CrossLineCursorTool
                position={rulersCoordinates}
                margin={margin}
                width={width - toolbarWidth}
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
                <XAxis
                  showGrid={true}
                  isFID={true}
                />

                <YAxis
                  label="PPM"
                  show={false}
                />
                {_selectedTool === options.zoom.id && (
                  <BrushTool
                    onDomainReset={handleRestDomain}
                    onXAxisDomainUpdate={handleXDomainUpdate}
                    onYAxisDomainUpdate={handleYDomainUpdate}
                    margin={margin}
                    width={width - toolbarWidth}
                    height={height}
                    data={data}
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
                notationData={peakNotations}
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

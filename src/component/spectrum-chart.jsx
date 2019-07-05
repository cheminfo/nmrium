import React, { useState, useEffect, useRef } from 'react';
import './css/spectrum-chart.css';
import PropTypes from 'prop-types';
import OptionsPane, { options } from './options-pane';
import YAxis from './axis-y';
import XAxis from './axis-x';
import BrushTool from './tool/brush-tool';
import Lines from './lines';
import ZoomTool from './tool/zoom-tool';
import CrossLineCursorTool from './tool/cross-line-tool';

import * as d3 from 'd3';
import PeakNotaion from './tool/peak-notation-tool';
// import { Window, TitleBar } from 'react-desktop/windows';
// import Draggable from 'react-draggable';

const SpectrumChart = ({ margin, width, height, data }) => {
  const refSVG = useRef();
  const refMain = useRef();

  const [_xDomain, setXDomain] = useState(0);
  const [_yDomain, setYDomain] = useState(0);
  const [_orignDomain, setOriginDomain] = useState([]);
  const [_toolOption, setToolOption] = useState({
    brush: false,
    zoom: true,
    peakTool: false,
  });

  const [rulersCoordinates, setRullerCoordinates] = useState({ x: 0, y: 0 });
  // const [xCoordinate, setXcoordinate] = useState(0);
  // const [yCoordinate, setYCoordinate] = useState(0);

  // const [drawAreaCoordinates, setDrawAreaCoordinates] = useState({
  //   x: 0,
  //   y: 0,
  // });
  const [peakNotations, setPeakNotaions] = useState([]);

  // const [_width, setWidth] = useState(width);
  // const [_height, setHeight] = useState(height);
  // const [_isMaximized, setIsMaximized] = useState(false);
  // const [_windowPosition, setWindowPosition] = useState(null);

  useEffect(() => {
    console.log(width);

    const domain = getDomain(data);
    console.log(domain);

    setOriginDomain(domain);
    setXDomain(domain.x);
    setYDomain(domain.y);
  }, []);

  const handleChangeOption = (option) => {
    if (option === options.brush.id) {
      setToolOption({ brush: true, zoom: false, peakTool: false });
    } else if (option === options.zoom.id) {
      setToolOption({ brush: false, zoom: true, peakTool: false });
    } else if (option === options.peaktool.id) {
      setToolOption({ brush: false, zoom: false, peakTool: true });
    } else {
      setToolOption({ brush: false, zoom: false, peakTool: false });
    }
  };

  /**
   * get Domain for x axis and y axis
   * @param {array} data
   */
  function getDomain(data = []) {
    let xArray = [];
    let yArray = [];

    for (let d of data) {
      xArray = xArray.concat(d['x']);
      yArray = yArray.concat(d['y']);
    }
    return { x: d3.extent(xArray), y: d3.extent(yArray) };
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
    // console.log(refSVG.current.getBoundingClientRect().top);
    // console.log(refSVG.current.getBoundingClientRect());
    const mousey = e.pageY - refSVG.current.getBoundingClientRect().top;

    requestAnimationFrame(() => {
      setRullerCoordinates({ x: mousex, y: mousey });
      // setXDomain(_orignDomain.x);
    });
  };

  const getScale = () => {
    const x = d3.scaleLinear(_xDomain, [margin.left, width - margin.right]);
    const y = d3.scaleLinear(_yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };



  const handleAddPeak=(e)=>{
    const scale = getScale();
    const points = [...peakNotations];
    points.push({
      x: scale.x.invert(rulersCoordinates.x),
      y: scale.y.invert(rulersCoordinates.y),
      id:scale.x.invert(rulersCoordinates.x).toString()+"-"+scale.y.invert(rulersCoordinates.y)
    });
    setPeakNotaions(points);
  }

  const mouseClick = (e) => {
    
    //activat selected peak tool
    if (_toolOption.peakTool) {
      
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
    // <Draggable
    //   // axis="x"
    //   handle=".handle"
    //   defaultPosition={{ x: 0, y: 0 }}
    //   position={_windowPosition}
    //   grid={[25, 25]}
    //   scale={1}
    // >
    //   <Window
    //     color="white"
    //     theme="dark"
    //     chrome
    //     height={_height+80}
    //     width={_width}
    //     // padding="12px"
    //     background="white"
    //   >
    //     <TitleBar
    //       className="handle"
    //       title="Spectrum Chart"
    //       isMaximized={_isMaximized}
    //       theme="black"
    //       color="red"
    //       controls={true}
    //       onMaximizeClick={toggleMaximize}
    //       onRestoreDownClick={toggleMaximize}
    //     />

    <div
      className="main-container"
      ref={refMain}
      style={{ width: `${width}px` }}
    >
      <div>
        <OptionsPane onChangeOption={handleChangeOption} />
      </div>
      <div>
        <svg
          ref={refSVG}
          onMouseMove={mouseMove}
          onClick={mouseClick}
          width={width}
          height={height}
        >

          
<CrossLineCursorTool
            position={rulersCoordinates}
            // postion_y={yCoordinate}
            margin={margin}
            width={width}
            height={height}
          />
     

          {(_xDomain, _yDomain) ? (
            <Lines
              margin={margin}
              width={width}
              height={height}
              data={data}
              xDomain={_xDomain}
              yDomain={_yDomain}
            />
          ) : null}

          <g className="container">
            <XAxis
              margin={margin}
              width={width}
              height={height}
              domain={_xDomain}
              showGrid={true}
              isFID={true}
            />

            <YAxis
              margin={margin}
              width={width}
              height={height}
              domain={_yDomain}
              label="PPM"
              show={true}
            />

            <BrushTool
              onDomainReset={handleRestDomain}
              onXAxisDomainUpdate={handleXDomainUpdate}
              onYAxisDomainUpdate={handleYDomainUpdate}
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={{ x: _xDomain, y: _yDomain }}
              originDomain={_orignDomain}
              isActive={_toolOption.zoom}
            />
            <ZoomTool
              onXAxisDomainUpdate={handleXDomainUpdate}
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={{ x: _xDomain, y: _yDomain }}
              originDomain={_orignDomain}
              isActive={_toolOption.brush}
            />
          </g>



          <PeakNotaion
            notationData={peakNotations}
            xDomain={_xDomain}
            yDomain={_yDomain}
            margin={margin}
            width={width}
            height={height}
          />


        </svg>
      </div>
    </div>
    // </Window>
    // </Draggable>
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

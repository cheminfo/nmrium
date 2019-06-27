import React, {useState } from "react";
import "./css/spectrum-chart.css";
import PropTypes from "prop-types";
import OptionsPane, { options } from "./options-pane";
import YAxis from "./axis-y";
import XAxis from "./axis-x";
import BrushTool from "./tool/brush-tool";
import Lines from "./lines";
import ZoomTool from "./tool/zoom-tool";

const SpectrumChart = ({ margin, width, height, data }) => {

  const [_xDomain, setXDomain] = useState(0);
  const [_yDomain, setYDomain] = useState(0);
  const [_orignXDomain, setOriginalXDomain] = useState([]);
  const [_toolOption, setToolOption] = useState({ brush: false, zoom: false });

  const handleChangeOption = option => {
    if (option === options.brush.id) {
      setToolOption({ brush: true, zoom: false });
    } else if (option === options.zoom.id) {
      setToolOption({ brush: false, zoom: true });
    } else {
      setToolOption({ brush: false, zoom: false });
    }
  };

  const brushUpdate = xDomain => {
    setXDomain(xDomain);
  };

  const handleXAxisDidMount = xDomain => {
    setXDomain(xDomain);
    setOriginalXDomain(xDomain);
  };

  const handleYAxisDidMount = yDomain => {
    setYDomain(yDomain);
  };

  return (
    <div className="main-container" style={{ width: `${width}px` }}>
      <div>
        <OptionsPane onChangeOption={handleChangeOption} />
      </div>
      <div>
        <svg width={width} height={height}>
          {(_xDomain, _yDomain) ? (
            <Lines
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={{ x: _xDomain, y: _yDomain }}
            />
          ) : null}

          <g className="container">
            <XAxis
              onAxisDidMount={handleXAxisDidMount}
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={_xDomain}
              showGrid={true}
              isFID={true}
            />

            <YAxis
              onAxisDidMount={handleYAxisDidMount}
              margin={margin}
              width={width}
              height={height}
              data={data}
              label="PPM"
              show={false}
            />

            <BrushTool
              onDomainUpdate={brushUpdate}
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={_xDomain}
              orignXDomain={_orignXDomain}
              isActive={_toolOption.brush}
            />
            <ZoomTool
              onDomainUpdate={brushUpdate}
              margin={margin}
              width={width}
              height={height}
              data={data}
              domain={_xDomain}
              orignXDomain={_orignXDomain}
              isActive={_toolOption.zoom}
            />
          </g>
        </svg>
      </div>
    </div>
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
    left: PropTypes.number.isRequired
  })
};

SpectrumChart.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 }
};

export default SpectrumChart;

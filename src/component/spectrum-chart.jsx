import React, { Component } from "react";
import "./css/spectrum-chart.css";
import PropTypes from "prop-types";
import OptionsPane, { options } from "./options-pane";
import YAxis from "./axis-y";
import XAxis from "./axis-x";
import BrushTool from "./tool/brush-tool";
import Lines from "./lines";
import ZoomTool from "./tool/zoom-tool";

class SpectrumChart extends Component {
  constructor(props) {
    super(props);

    const { margin, width, height, data } = this.props;
    this.width = width;
    this.height = height;
    this.margin = margin;

    this.state = {
      data: data,
      xDomain: 0,
      yDomain: 0,
      orignXDomain: [],
      option: {
        brush: false,
        zoom: false
      }
    };

    console.log(this.state.data);
  }

  handleChangeOption = option => {
    this.setState({ option: options.brush.id });
    if (option === options.brush.id) {
      this.setState({ option: { brush: true, zoom: false } });
    } else if (option === options.zoom.id) {
      this.setState({ option: { brush: false, zoom: true } });
    } else {
      this.setState({ option: { brush: false, zoom: false } });
    }

    console.log(this.state.option);
  };

  brushUpdate = xDomain => {
    this.setState({ xDomain });
  };

  handleXAxisDidMount = xDomain => {
    this.setState({ xDomain, orignXDomain: xDomain });
  };

  handleYAxisDidMount = yDomain => {
    this.setState({ yDomain });
  };

  render() {
    return (
      <div className="main-container" style={{ width: `${this.width}px` }}>
        <div>
          <OptionsPane onChangeOption={this.handleChangeOption} />
        </div>
        <div>
          <svg width={this.width} height={this.height}>
            {(this.state.xDomain, this.state.yDomain) ? (
              <Lines
                margin={this.margin}
                width={this.width}
                height={this.height}
                data={this.state.data}
                domain={{ x: this.state.xDomain, y: this.state.yDomain }}
              />
            ) : null}

            <g className="container">
              <XAxis
                onAxisDidMount={this.handleXAxisDidMount}
                margin={this.margin}
                width={this.width}
                height={this.height}
                data={this.state.data}
                domain={this.state.xDomain}
                showGrid={true}
                label="PPM"
              />

              <YAxis
                onAxisDidMount={this.handleYAxisDidMount}
                margin={this.margin}
                width={this.width}
                height={this.height}
                data={this.state.data}
                label="PPM"
              />

              <BrushTool
                onDomainUpdate={this.brushUpdate}
                margin={this.margin}
                width={this.width}
                height={this.height}
                data={this.state.data}
                domain={this.state.xDomain}
                orignXDomain={this.state.orignXDomain}
                isActive={this.state.option.brush}
              />
              <ZoomTool
                onDomainUpdate={this.brushUpdate}
                margin={this.margin}
                width={this.width}
                height={this.height}
                data={this.state.data}
                domain={this.state.xDomain}
                orignXDomain={this.state.orignXDomain}
                isActive={this.state.option.zoom}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

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

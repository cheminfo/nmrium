import React, { Component } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

class Lines extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [], domain: {} };
    const { width, height, margin, data } = this.props;
    this.width = width;
    this.margin = margin;
    this.height = height;
    this.data = data;
  }

  makePath(data) {
    const { domain } = this.state;
    const scale = this.getScale(domain);

    let path = `M ${scale.x(data.x[0])} ${scale.y(data.y[0])}`;

    path += data.x.map((element, i) => {
      return ` L ${scale.x(element)} ${scale.y(data.y[i])}`;
    });

    return path;
  }

  getScale = domain => {
    const x = d3.scaleLinear(domain.x, [
      this.margin.left,
      this.width - this.margin.right
    ]);

    const y = d3.scaleLinear(domain.y, [
      this.height - this.margin.bottom,
      this.margin.top
    ]);

    return { x, y };
  };

  generatePaths() {
    return this.state.data.map((d, i) => {
      return (
        <path
          className="line"
          key={d.id}
          stroke={d.color}
          d={this.makePath(d)}
        />
      );
    });
  }

  static getDerivedStateFromProps(props, state) {
    const { data, domain } = props;

    return { data, domain };
  }

  render() {
    return (
      <React.Fragment>
        <defs>
          <clipPath id="clip">
            <rect
              width={`${this.width - this.margin.left - this.margin.right}`}
              height={`${this.height - this.margin.top - this.margin.bottom}`}
              x={`${this.margin.left}`}
              y={`${this.margin.top}`}
            />
          </clipPath>
        </defs>

        <g className="paths" ref="paths" clipPath="url(#clip)">
          {this.generatePaths()}
        </g>
      </React.Fragment>
    );
  }
}

export default Lines;

Lines.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired
  }),
  domain: PropTypes.shape({
    x: PropTypes.array.isRequired,
    y: PropTypes.array.isRequired
  })
};

Lines.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  domain: { x: 0, y: 0 }
};

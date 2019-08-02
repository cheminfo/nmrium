import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import CrossLinePointer from './CrossLinePointer';
import '../css/integral-tool.css';
import { XY } from 'ml-spectra-processing';

class IntegralTool extends Component {
  integrals = [];
  state = {
    integrals: [],
  };

  constructor(props) {
    super(props);
    const { width, height, margin } = this.props;
    this.brush = d3
      .brushX()
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);

    this.IsActive = this.IsActive.bind(this);
    this.makePath = this.makePath.bind(this);
  }

  brushEnd = () => {
    const { getScale, mode, data, activeSpectrum } = this.props;
    if (activeSpectrum) {
      if (!d3.event.selection) {
        return;
      }

      const [x1, x2] = d3.event.selection;
      // const scale = d3.scaleLinear(this.domain.x, [
      //   this.width - this.margin.right,
      //   this.margin.left
      // ]);

      const scale = getScale().x;

      const range =
        mode === 'RTL'
          ? [scale.invert(x2), scale.invert(x1)]
          : [scale.invert(x1), scale.invert(x2)];

      console.log(activeSpectrum);

      console.log(data);

      const _data = data.find((d) => d.id === activeSpectrum.id);

      console.log(_data);

      const integralResult = XY.integral(_data, {
        from: range[0],
        to: range[1],
      });

      this.setState({
        integrals:
          this.state.integrals.length > 0
            ? [
                ...this.state.integrals,
                { id: activeSpectrum.id, ...integralResult },
              ]
            : [{ id: activeSpectrum.id, ...integralResult }],
      });

      console.log(this.state.integrals);

      console.log(d3.event.selection);
      console.log(range);

      d3.select(this.refs.brush).call(this.brush.move, null); // This remove the grey brush area as soon as the selection has been done
      this.props.onIntegralDrawFinished(d3.event.selection);
    }
  };

  componentDidMount() {
    const { isActive, width, height, margin } = this.props;
    this.brush.extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ]);

    d3.select(this.refs.brush)
      .selectAll('*')
      .remove();

    d3.select(this.refs.brush).call(this.brush);
    this.brush.on('end', this.brushEnd);
  }

  makePath(data) {
    console.log('0000000000000000000000000');
    const { domain, getScale } = this.props;
    const { id, x, y } = data;
    const scale = getScale(id);
    const pathPoints = XY.reduce(x, y, {
      from: domain.x[0],
      to: domain.x[1],
    });

    let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;

    path += pathPoints.x
      .slice(1)
      .map((point, i) => {
        return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
      })
      .join('');

    console.log(path);

    return path;
  }

  // useEffect(() => {

  //  console.log('domain changed')
  //  console.log(data);
  // //  setData(data);

  // },[xDomain]);

  // useEffect(() => {
  //   const paths = data.map((d, i) => {
  //     return { path: makePath(d), id: d.id, color: d.color };
  //   });

  //   setPaths(paths);
  // }, [xDomain, yDomain]);

  // function getScale(xDomain, yDomain) {
  //   console.log(width);
  //   console.log(height);
  //   const x = d3.scaleLinear(xDomain, [width - margin.right, margin.left]);
  //   const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
  //   return { x, y };
  // }

  IsActive = (id) => {
    const { activeSpectrum } = this.props;
    return activeSpectrum === null
      ? true
      : id === activeSpectrum.id
      ? true
      : false;
  };

  componentDidUpdate(prevProps, prevState) {}

  render() {
    const { isActive, width, height, margin, position } = this.props;

    return (
      <Fragment>
        {/* <CrossLinePointer
          position={position}
          margin={margin}
          width={width}
          height={height}
        /> */}
        <g
          className={
            isActive ? 'integral-container brush ' : 'integral-container'
          }
          onDoubleClick={this.reset}
          ref="brush"
        />

        <g key={'path'}>
          <defs>
            <clipPath id="clip">
              <rect
                width={`${width - margin.left - margin.right}`}
                height={`${height - margin.top - margin.bottom}`}
                x={`${margin.left}`}
                y={`${margin.top}`}
              />
            </clipPath>
          </defs>

          <g className="paths" clipPath="url(#clip)">
            {this.state.integrals &&
              this.state.integrals[0] &&
              this.state.integrals[0].x &&
              this.state.integrals.map((d, i) => (
                // d.isVisible &&
                <path
                  className="line"
                  key={d.id}
                  // stroke={d.color}
                  stroke="red"

                  style={{ opacity: this.IsActive(d.id) ? 1 : 0.2 }}
                  d={this.makePath(d)}
                />
              ))}
          </g>
        </g>
      </Fragment>
    );
  }
}

export default IntegralTool;

IntegralTool.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  domain: PropTypes.object.isRequired,
  onIntegralDrawFinished: PropTypes.func.isRequired,
};

IntegralTool.defaultProps = {
  onIntegralDrawFinished: () => {
    return [];
  },
};

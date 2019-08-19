import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import '../css/integral-tool.css';
import { XY } from 'ml-spectra-processing';

class IntegralTool extends Component {
  constructor(props) {
    super(props);
    const { width, height, margin } = this.props;
    this.brush = d3
      .brushX()
      .extent([[0, 0], [width - margin.right, height - margin.bottom]]);
  }

  brushEnd = () => {
    const { getScale, mode, data, activeSpectrum } = this.props;
    if (activeSpectrum) {
      if (!d3.event.selection) {
        return;
      }

      const [x1, x2] = d3.event.selection;

      const scale = getScale().x;

      const range =
        mode === 'RTL'
          ? [scale.invert(x2), scale.invert(x1)]
          : [scale.invert(x1), scale.invert(x2)];

      const _data = data.find((d) => d.id === activeSpectrum.id);

      const integralResult = XY.integral(_data, {
        from: range[0],
        to: range[1],
        reverse: true,
      });

      const integralValue = XY.integration(_data, {
        from: range[0],
        to: range[1],
        reverse: true,
      });

      this.props.onIntegralDrawFinished({
        id: activeSpectrum.id,
        from: range[0],
        to: range[1],
        ...integralResult,
        value: integralValue,
      });
    }
  };

  componentDidMount() {
    const { width, height, margin } = this.props;
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

  componentDidUpdate(prevProps, prevState) {}

  render() {
    const { isActive } = this.props;

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

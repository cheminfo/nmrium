import React from 'react';
import PropTypes from 'prop-types';

import '../css/peak-notification-tool.css';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';

const PeakNotationTool = ({ position }) => {
  const { getScale, data, activeSpectrum } = useChartData();

  const getXValue = (xVal) => {
    const spectrumData = data.find((d) => d.id === activeSpectrum.id);

    return getScale()
      .x.invert(xVal)
      .toFixed(getPeakLabelNumberDecimals(spectrumData.nucleus));
  };

  if (!position) return null;
  return (
    activeSpectrum && (
      <g
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <text dy="0em" dx="0.35em">
          {getXValue(position.x)}
        </text>
      </g>
    )
  );
};

export default PeakNotationTool;

PeakNotationTool.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  xDomain: PropTypes.array,
  yDomain: PropTypes.array,
};

import React from 'react';
import PropTypes from 'prop-types';

import '../css/cross-line-tool.css';
import { useDimension } from '../context/DimensionsContext';

const CrossLinePointer = ({ position }) => {
  const { height, width, margin } = useDimension();

  return (
    position.x !== 0 &&
    position.y !== 0 && (
      <g key="crossLine">
        <line
          className="vertical_line"
          x1={position.x}
          y1="0"
          x2={position.x}
          y2={`${height - margin.top}`}
          key="vertical_line"
        />
        <line
          className="vertical_line"
          x1="0"
          y1={position.y}
          x2={`${width}`}
          y2={position.y}
          key="horizontal_line"
        />
      </g>
    )
  );
};

export default CrossLinePointer;

CrossLinePointer.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

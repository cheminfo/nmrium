import React from 'react';
import PropTypes from 'prop-types';
import '../css/cross-line-tool.css';

const CrossLineCursorTool = ({ position, height, width, margin }) => {
  return (
    <g>
      <line
        className="vertical_line"
        x1={position.x}
        y1="0"
        x2={position.x}
        y2={`${height - margin.top}`}
      />
      <line className="vertical_line" x1="0" y1={position.y} x2={`${width}`} y2={position.y} />
    </g>
  );
};

export default CrossLineCursorTool;

CrossLineCursorTool.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
};

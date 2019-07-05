import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import '../css/peak-notification-tool.scss';

export const NotationTemplate = ({ id, x, y, value }) => {
  // console.log(x);
  const refText = useRef();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const textBox = refText.current.getBBox();
    setContainerSize({ width: textBox.width, height: textBox.height });
  }, []);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0"
        y="-30"
        width={containerSize.width + 10}
        height={containerSize.height}
        className="notification-label"

      />

      <line x1="0" x2="0" y1="0" y2={-30} stroke="black" strokeWidth="1" />
      <text ref={refText} x="0" y={-20} dy="0.1em" dx="0.35em">
        {value}
      </text>
      <circle cx="0" cy="0" r="1" fill="red" />
      <rect
        x="-10"
        y="-40"
        width={containerSize.width + 30}
        height="50"
        className="notifcate-selected"
      />
    </g>
  );
};

const PeakNotaion = ({
  notationData,
  xDomain,
  yDomain,
  height,
  width,
  margin,
}) => {

  const [scale, setScale] = useState();

  const getScale = () => {
    const x = d3.scaleLinear(xDomain, [width - margin.right,margin.left]);
    const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };

  useEffect(() => {
    setScale(getScale());


    console.log(yDomain);
    
  }, [xDomain, yDomain,width,height]);

  return (
    <g>
      {notationData.map((d, i) => (
        <NotationTemplate
          key={i}
          x={scale.x(d.x)}
          y={scale.y(d.y)}
          id={d.id}
          value={d.x.toFixed(2)}
        />
      ))}
    </g>
  );
};

export default PeakNotaion;

PeakNotaion.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  xDomain: PropTypes.array.isRequired,
  yDomain: PropTypes.array.isRequired,
};

PeakNotaion.defaultProps = {
  width: 800,
  height: 800,
  data: [],
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  xDomain: 0,
  yDomain: 0,
};

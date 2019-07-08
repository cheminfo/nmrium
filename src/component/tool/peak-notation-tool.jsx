import React, { useEffect, useRef, useState, Fragment } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import '../css/peak-notification-tool.css';

export const NotationTemplate = ({
  id,
  x,
  y,
  value,
  onPeakValueChange,
  onSelected,
}) => {
  const refText = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [_value, setValue] = useState(value);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const textBox = refText.current.getBBox();
    setContainerSize({ width: textBox.width, height: textBox.height });
  }, []);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleSaveChange = (event) => {
    if (event.key === 'Enter') {
      onPeakValueChange({ id: id, value: event.target.value });
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSelectPeakNotation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelected(id);
    setIsSelected(true);
  };
  const handleMouseOutPeakNotation = (e) => {
    setIsSelected(false);
  };

  return (
    <Fragment>
    <g id={id} transform={`translate(${x}, ${y})`}>
      {/* <rect
        x="0"
        y="-30"
        width={containerSize.width + 10}
        height={containerSize.height}
      /> */}

      <line x1="0" x2="0" y1="0" y2={-30} stroke="black" strokeWidth="1" />
      <text ref={refText} x="0" y={-20} dy="0.1em" dx="0.35em">
        {value}
      </text>

      {/* <circle cx="0" cy="0" r="1" fill="red" /> */}

      <foreignObject
        onMouseOut={handleMouseOutPeakNotation}
        x="0"
        y="-30"
        width={containerSize.width + 20}
        height={containerSize.height + 10}
      >
        <div
          style={{
            width: containerSize.width + 20,
            height: containerSize.height + 10,
            paddingRight: 5,
          }}
          xmlns="http://www.w3.org/1999/xhtml"
        >
          <input
            onClick={handleSelectPeakNotation}
            className={
              isSelected
                ? 'notification-input input-over'
                : 'notification-input'
            }
            value={_value}
            onKeyDown={handleSaveChange}
            onChange={handleChange}
          />
        </div>
      </foreignObject>
      {/* 
      <rect
        x="0"
        y="0"
        width={containerSize.width + 10}
        height={containerSize.height + 30}
        onMouseEnter={handleMouseOverPeakNotation}
        onMouseOut={handleMouseOutPeakNotation}
        className="notifcate-selected"
      /> */}
    </g>

    </Fragment>
  );
};

const PeakNotaion = ({
  notationData,
  xDomain,
  yDomain,
  height,
  width,
  margin,
  onPeakValueChange,
}) => {
  const [scale, setScale] = useState();
  const [notationId, setNotationId] = useState();

  const getScale = () => {
    const x = d3.scaleLinear(xDomain, [width - margin.right, margin.left]);
    const y = d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    return { x, y };
  };

  useEffect(() => {
    setScale(getScale());

    console.log(yDomain);
  }, [xDomain, yDomain, width, height]);

  const handelOnSelected = (id) => {
    console.log(id);
    setNotationId(id);
  };

  return (
    <g>
      {notationData.map((d, i) => (
        <NotationTemplate
          key={i}
          x={scale.x(d.x)}
          y={scale.y(d.y)}
          id={d.id}
          value={d.x.toFixed(5)}
          onPeakValueChange={onPeakValueChange}
          onSelected={handelOnSelected}
        />
      ))}
    </g>
  );
};

export default PeakNotaion;

PeakNotaion.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
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
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  xDomain: 0,
  yDomain: 0,
};

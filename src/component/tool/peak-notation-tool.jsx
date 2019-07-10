import React, { useEffect, useRef, useState, Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import '../css/peak-notification-tool.css';
import {ChartContext} from '../chart-context';

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
      const newValue = parseFloat(event.target.value);
      const oldValue = parseFloat(value);
      const shiftValue = parseFloat(event.target.value) - parseFloat(value);
       console.log({ id: id, value: newValue,oldValue:oldValue,shiftValue: shiftValue});
      onPeakValueChange({ id: id, value: newValue,oldValue:oldValue,shiftValue: shiftValue});
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
            type="number"
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
  onPeakValueChange
}) => {
  const { getScale } = useContext(ChartContext); 

  // const [notationId, setNotationId] = useState();

  const handelOnSelected = (id) => {
    console.log(id);
    // setNotationId(id);
  };

  return (

    <g>
      {notationData.map((d, i) => (
        <NotationTemplate
          key={i}
          x={getScale().x(d.x)}
          y={getScale().y(d.y)}
          id={d.id}
          value={d.x}
          onPeakValueChange={onPeakValueChange}
          onSelected={handelOnSelected}
        />
      ))}
    </g>
  );
};

export default PeakNotaion;

PeakNotaion.contextTypes = {
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

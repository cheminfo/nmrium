import React, {
  useEffect,
  useRef,
  useState,
  Fragment,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import '../css/peak-notification-tool.css';
import { ChartContext } from '../context/chart-context';

export const NotationTemplate = ({
  id,
  x,
  y,
  value,
  onPeakValueChange,
  onSelected,
  color,
  isActive,
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
      onPeakValueChange({
        id: id,
        value: newValue,
        oldValue: oldValue,
        shiftValue: shiftValue,
      });
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
              style={{
                border: `1px solid ${color}`,
                opacity: isActive ? 1 : 0.2,
              }}
              value={_value}
              onKeyDown={handleSaveChange}
              onChange={handleChange}
              type="number"
              disabled={!isActive}
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

const PeakNotation = ({ notationData, onPeakValueChange }) => {
  const { getScale, data, activeSpectrum, verticalAlign } = useContext(
    ChartContext,
  );

  // const [notationId, setNotationId] = useState();
  useEffect(() => {}, []);

  const handelOnSelected = (id) => {
    console.log(id);
    // setNotationId(id);
  };

  const reSortData = () => {
    const _data = [...data];

    return activeSpectrum
      ? _data.sort(function(x, y) {
          return x.id === activeSpectrum.id
            ? 1
            : y.id === activeSpectrum.id
            ? -1
            : 0;
        })
      : _data;
  };

  const getVerticalAlign = (id) => {
    return data.findIndex((d) => d.id === id) * verticalAlign;
  };

  return (
    <g key="peakNotification">
      {data &&
        reSortData().map((d, i) => {
          return (
            <g key={i} transform={`translate(0,${getVerticalAlign(d.id)})`}>
              {notationData &&
                notationData[d.id] &&
                d.isVisible &&
                notationData[d.id].map(({ xIndex }, i) => (
                  <NotationTemplate
                    key={i}
                    x={getScale(d.id).x(d.x[xIndex])}
                    y={getScale(d.id).y(d.y[xIndex])}
                    id={xIndex}
                    value={d.x[xIndex]}
                    onPeakValueChange={onPeakValueChange}
                    onSelected={handelOnSelected}
                    color={d.color}
                    isActive={
                      activeSpectrum === null
                        ? false
                        : activeSpectrum.id === d.id
                        ? true
                        : false
                    }
                  />
                ))}
            </g>
          );
        })}
    </g>
  );
};

export default PeakNotation;

PeakNotation.contextTypes = {
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

import React, {
  useEffect,
  useRef,
  useState,
  Fragment,
  useContext,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';
import '../css/peak-notification-tool.css';
import { ChartContext } from '../context/ChartContext';
import { FaMinus } from 'react-icons/fa';
import { getPeakLabelNumberDecimals } from '../../data/default';
import { useDispatch } from '../context/DispatchContext';
import { SHIFT_SPECTRUM, DELETE_PEAK_NOTATION } from '../reducer/Actions';

export const NotationTemplate = ({
  id,
  spectrumID,
  x,
  y,
  value,
  color,
  isActive,
  decimalFraction,
}) => {
  const refText = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [_value, setValue] = useState(value);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isOver, setIsOver] = useState({ id: null, flag: false });

  const dispatch = useDispatch();
  const handleOnPeakChange = useCallback(
    (e) => dispatch({ type: SHIFT_SPECTRUM, shiftValue: e.shiftValue }),
    [dispatch],
  );
  const handleDeleteNotation = useCallback(
    (e, data) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: DELETE_PEAK_NOTATION, data });
    },
    [dispatch],
  );

  useLayoutEffect(() => {
    const textBox = refText.current.getBBox();
    setContainerSize({ width: textBox.width, height: textBox.height });
  }, [isSelected]);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        const newValue = parseFloat(event.target.value);
        const oldValue = parseFloat(value);
        const shiftValue = parseFloat(event.target.value) - parseFloat(value);

        handleOnPeakChange({
          id: id,
          value: newValue,
          oldValue: oldValue,
          shiftValue: shiftValue,
        });

        event.target.blur();
        setIsSelected(false);
      } else if (event.keyCode === 27) {
        setValue(value);
        event.target.blur();
        setIsSelected(false);
      }
    },
    [id, value, handleOnPeakChange],
  );

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const handleSelectPeakNotation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // onSelected(id);
    setIsSelected(true);
  }, []);

  const handleOnOverNotation = useCallback((id) => {
    setIsOver({ id: id, flag: true });
  }, []);

  const handleOnMouseLeaveNotation = useCallback(() => {
    setTimeout(() => {
      setIsOver({ id: null, flag: false });
    }, 200);
  }, []);

  return (
    <Fragment>
      <g
        id={id}
        transform={`translate(${x}, ${y})`}
        onMouseOver={() => {
          handleOnOverNotation(id);
        }}
        onMouseLeave={handleOnMouseLeaveNotation}
      >
        {/* <rect
        x="0"
        y="-30"
        width={containerSize.width + 10}
        height={containerSize.height}
      /> */}

        <line x1="0" x2="0" y1="-5" y2={-30} stroke={color} strokeWidth="1" />
        <text
          ref={refText}
          x="0"
          y={-20}
          dy="0.1em"
          dx="0.35em"
          fill="transparent"
        >
          {isSelected ? value : parseFloat(value).toFixed(decimalFraction)}
        </text>

        {/* <circle cx="0" cy="0" r="1" fill="red" /> */}

        <foreignObject
          x="0"
          y="-30"
          width={containerSize.width + 20}
          height={containerSize.height + 30}
        >
          <div
            style={{
              width: containerSize.width + 20,
              height: containerSize.height + 30,
              paddingRight: 5,
            }}
            xmlns="http://www.w3.org/1999/xhtml"
          >
            <input
              onClick={handleSelectPeakNotation}
              className={
                isSelected
                  ? 'notification-input input-over'
                  : 'notification-input-normal'
              }
              style={{
                width: 'inherit',
                border: isSelected ? `1px solid ${color}` : `0`,
                opacity: isActive ? 1 : 0.2,
              }}
              value={
                isSelected
                  ? _value
                  : parseFloat(_value).toFixed(decimalFraction)
              }
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              type="number"
              disabled={!isActive}
            />
            {isOver.id && isOver.flag === true && (
              <button
                onClick={(e) =>
                  handleDeleteNotation(e, { xIndex: id, id: spectrumID })
                }
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  border: 0,
                  padding: 0,
                  width: 15,
                  height: 15,
                  borderRadius: 15,
                  position: 'absolute',
                  left: containerSize.width,
                  top: containerSize.height + 7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaMinus />
              </button>
            )}
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

const PeakNotationTool = ({ position, showCursorLabel }) => {
  const { getScale, data, activeSpectrum, verticalAlign } = useContext(
    ChartContext,
  );

  const getXValue = (xVal) => {
    const spectrumData = data.find((d) => d.id === activeSpectrum.id);
    
    return getScale()
      .x.invert(xVal)
      .toFixed(getPeakLabelNumberDecimals(spectrumData.nucleus));
  };

  const PeaksNotations = useMemo(() => {
    const getVerticalAlign = (id) => {
      return data.findIndex((d) => d.id === id) * verticalAlign;
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

    return (
      data &&
      reSortData()
        .filter((d) => d.isVisible === true)
        .map((d, i) => {
          return (
            <g key={i} transform={`translate(0,${getVerticalAlign(d.id)})`}>
              {d.peaks &&
                d.isPeaksMarkersVisible &&
                d.peaks.map(({ xIndex }, j) => (
                  <NotationTemplate
                    key={`peak-${d.id}-${j}`}
                    x={getScale(d.id).x(d.x[xIndex])}
                    y={getScale(d.id).y(d.y[xIndex])}
                    id={xIndex}
                    spectrumID={d.id}
                    value={d.x[xIndex]}
                    color={d.color}
                    decimalFraction={getPeakLabelNumberDecimals(d.nucleus)}
                    isActive={
                      activeSpectrum == null
                        ? false
                        : activeSpectrum.id === d.id
                        ? true
                        : false
                    }
                  />
                ))}
            </g>
          );
        })
    );
  }, [data, activeSpectrum, getScale, verticalAlign]);

  return (
    <Fragment>
      <g key="peakNotification" />
      {PeaksNotations}
      {showCursorLabel && activeSpectrum && (
        <g>
          <text x={position.x} y={position.y} dy="0em" dx="0.35em">
            {getXValue(position.x)}
          </text>
        </g>
      )}
    </Fragment>
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
  onPeakValueChange: PropTypes.func,
  onDeleteNotation: PropTypes.func,
};

PeakNotationTool.defaultProps = {
  onPeakValueChange: () => {
    return null;
  },
  onDeleteNotation: () => {
    return null;
  },
};

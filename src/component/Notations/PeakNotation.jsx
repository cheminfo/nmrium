import React, {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from 'react';
import { FaMinus } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { SHIFT_SPECTRUM, DELETE_PEAK_NOTATION } from '../reducer/Actions';

/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core';

const styles = css`
  .delete-bt {
    background-color: red;
    color: white;
    border: 0px;
    border-radius: 15px;
    padding: 0px;
    width: 15px;
    height: 15px;
    border: 15px;
    position: absolute;
    display: 'flex';
    align-items: center;
    justify-content: center;
  }
  .notification-input {
    width: calc(100% - 10px) !important;
  }

  .notification-input-normal {
    opacity: 1;
    left: 4px;
    position: absolute;
    font-size: 10px;
    outline: none;
    user-select: none;
    background-color: transparent;
  }

  .notification-input-normal input:focus {
    outline: none;
    background-color: white;
  }

  .input-over {
    background-color: white;
    outline: none;
  }

  .notification-label {
    display: none;
  }

  .notification-group-over {
    z-index: 9999999999;
  }

  .notification-group {
    z-index: 1;
  }

  .notifcate-selected {
    opacity: 0;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const PeakNotation = ({
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
    setIsSelected(true);
    return false;
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
    <>
      <Global styles={styles} />

      <g
        id={id}
        transform={`translate(${x}, ${y})`}
        onMouseOver={() => {
          handleOnOverNotation(id);
        }}
        onMouseLeave={handleOnMouseLeaveNotation}
      >
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
                type="button"
                onClick={(e) =>
                  handleDeleteNotation(e, { xIndex: id, id: spectrumID })
                }
                className="delete-bt"
                style={{
                  left: containerSize.width,
                  top: containerSize.height + 7,
                }}
              >
                <FaMinus />
              </button>
            )}
          </div>
        </foreignObject>
      </g>
    </>
  );
};

export default PeakNotation;

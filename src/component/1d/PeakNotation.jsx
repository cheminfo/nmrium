/** @jsxImportSource @emotion/react */
import { css, Global } from '@emotion/react';
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  Fragment,
  useMemo,
} from 'react';

import { useDispatch } from '../context/DispatchContext';
import { TYPES, useHighlight } from '../highlight';
import { SHIFT_SPECTRUM } from '../reducer/types/Types';
import { useFormatNumberByNucleus } from '../utility/FormatNumber';

const styles = css`
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  text,
  input {
    -webkit-user-select: none; /* Safari 3.1+ */
    -moz-user-select: none; /* Firefox 2+ */
    -ms-user-select: none; /* IE 10+ */
    user-select: none; /* Standard syntax */
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  .notification-input {
    width: calc(100% - 10px) !important;
    user-select: 'none';
    -webkit-user-select: none; /* Chrome all / Safari all */
    -moz-user-select: none; /* Firefox all */
  }

  .notification-input-normal {
    opacity: 1;
    left: 4px;
    position: absolute;
    font-size: 10px;
    outline: none;
    user-select: 'none';
    -webkit-user-select: none; /* Chrome all / Safari all */
    -moz-user-select: none; /* Firefox all */
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

function PeakNotation({
  xIndex,
  id,
  x,
  y,
  sign, // 1 positive -1 negative
  value,
  color,
  isActive,
  nucleus,
}) {
  const refText = useRef();
  const [isSelected, setIsSelected] = useState(false);
  const [_value, setValue] = useState(value);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const format = useFormatNumberByNucleus(nucleus);
  const highlight = useHighlight([id], TYPES.PEAK);

  const dispatch = useDispatch();

  const handleOnPeakChange = useCallback(
    (e) => dispatch({ type: SHIFT_SPECTRUM, shiftValue: e.shiftValue }),
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
          id: xIndex,
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
    [value, handleOnPeakChange, xIndex],
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

  const handleOnEnterNotation = useCallback(() => {
    highlight.show();
  }, [highlight]);

  const handleOnMouseLeaveNotation = useCallback(() => {
    highlight.hide();
  }, [highlight]);

  const newValue = useMemo(() => (isSelected ? value : format(value)), [
    format,
    isSelected,
    value,
  ]);
  const oldValue = useMemo(() => (isSelected ? _value : format(_value)), [
    _value,
    format,
    isSelected,
  ]);

  return (
    <Fragment>
      <Global styles={styles} />
      <g
        id={xIndex}
        style={{ outline: 'none' }}
        transform={`translate(${x}, ${y})`}
        onMouseEnter={handleOnEnterNotation}
        onMouseLeave={handleOnMouseLeaveNotation}
        // onKeyDown={keyDownHandler}
      >
        <line
          x1="0"
          x2="0"
          y1={sign === -1 ? 10 : 0}
          y2={sign === -1 ? 28 : -18}
          stroke={color}
          strokeWidth={highlight.isActive ? '7px' : '1px'}
        />
        <text
          ref={refText}
          className="peaks-text"
          x="0"
          y={sign === -1 ? 28 : -12}
          dy="0"
          dx="0.35em"
          fill="transparent"
          fontSize="10px"
          fontWeight="100"
          style={{
            position: 'absolute',
          }}
        >
          {newValue}
        </text>
        <foreignObject
          x="0"
          y={sign === -1 ? 16 : -22}
          dy="0.1em"
          dx="0.35em"
          width={containerSize.width + 20}
          height="40px"
          data-no-export="true"
        >
          <div
            style={{
              width: containerSize.width + 20,
              height: '100%',
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
                userSelect: 'none',
                color: color,
              }}
              value={oldValue}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              type="number"
              disabled={!isActive}
            />
          </div>
        </foreignObject>
      </g>
    </Fragment>
  );
}

export default PeakNotation;

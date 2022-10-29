/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
  useMemo,
} from 'react';

import { useDispatch } from '../../context/DispatchContext';
import { HighlightEventSource, useHighlight } from '../../highlight';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { SHIFT_SPECTRUM } from '../../reducer/types/Types';
import { formatNumber } from '../../utility/formatNumber';

const styles = css`
  input {
    -webkit-user-select: text; /* Safari 3.1+ */
    -moz-user-select: text; /* Firefox 2+ */
    -ms-user-select: text; /* IE 10+ */
    user-select: text; /* Standard syntax */
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  .notification-input-normal {
    opacity: 1;
    left: 4px;
    position: fixed;
    font-size: 10px;
    outline: none;
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
`;

interface PeakAnnotationProps {
  id: string;
  x: number;
  y: number;
  sign: number;
  color: string;
  value: number;
  nucleus: string;
}

function PeakAnnotation({
  id,
  x,
  y,
  sign, // 1 positive -1 negative
  value,
  color,
  nucleus,
}: PeakAnnotationProps) {
  const refText = useRef<SVGTextElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [_value, setValue] = useState(value);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { deltaPPM } = usePanelPreferences('peaks', nucleus);
  const highlight = useHighlight([id], {
    type: HighlightEventSource.PEAK,
    extra: { id },
  });

  const dispatch = useDispatch();

  const handleOnPeakChange = useCallback(
    (e) => dispatch({ type: SHIFT_SPECTRUM, shiftValue: e.shiftValue }),
    [dispatch],
  );

  useLayoutEffect(() => {
    const textBox = refText.current?.getBBox();
    setContainerSize({
      width: textBox?.width || 0,
      height: textBox?.height || 0,
    });
  }, [isSelected]);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const newValue = event.currentTarget.valueAsNumber;
        if (!Number.isNaN(newValue)) {
          const shiftValue = newValue - value;

          handleOnPeakChange({
            id,
            value: newValue,
            oldValue: value,
            shiftValue,
          });

          event.currentTarget.blur();
          setIsSelected(false);
        }
      } else if (event.key === 'Escape') {
        setValue(value);
        event.currentTarget.blur();
        setIsSelected(false);
      }
    },
    [value, handleOnPeakChange, id],
  );

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const handleSelectPeakAnnotation = useCallback((e) => {
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

  const newValue = useMemo(
    () => (isSelected ? value : formatNumber(value, deltaPPM.format)),
    [deltaPPM.format, isSelected, value],
  );
  const oldValue = useMemo(
    () => (isSelected ? _value : formatNumber(_value, deltaPPM.format)),
    [_value, deltaPPM.format, isSelected],
  );

  return (
    <g
      css={styles}
      id={id}
      style={{ outline: 'none' }}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={handleOnEnterNotation}
      onMouseLeave={handleOnMouseLeaveNotation}
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
        >
          <input
            onClick={handleSelectPeakAnnotation}
            className={isSelected ? 'input-over' : 'notification-input-normal'}
            style={{
              width: 'inherit',
              border: isSelected ? `1px solid ${color}` : `0`,
              userSelect: 'none',
              color,
            }}
            value={oldValue}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            type="number"
          />
        </div>
      </foreignObject>
    </g>
  );
}

export default PeakAnnotation;

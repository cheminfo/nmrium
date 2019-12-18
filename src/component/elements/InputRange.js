import React, { useCallback } from 'react';

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0.55px solid #c7c7c7',
    borderRadius: '5px',
    userSelect: 'none',
    backgroundColor: '#18ce0f14',
    fontSize: '10px',
    color: '#00801d',
    margin: '0px 5px',
    cursor: 'ew-resize',
  },
  label: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
  },
};

let stateValues = {
  step: 'initial',
};

let timerId = null;
let speedX = 1;
let oldX = 0;
let firstCalc = true;
function calcSpeed(e) {
  if (!firstCalc) {
    speedX = e.clientX - oldX;
    oldX = e.clientX;
    setToZero();
  } else {
    oldX = e.clientX;
    firstCalc = false;
  }
}

function setToZero() {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    speedX = 0;
  }, 50);
}

const InputRange = ({
  name,
  minValue,
  maxValue,
  value: valueProps,
  onChange,
  label,
  style,
  className,
  noPropagation,
}) => {
  const mouseEnterHandler = useCallback(() => {
    if (stateValues.step === 'moving' || stateValues.step === 'start') {
      stateValues = {
        ...stateValues,
        step: stateValues.step === 'start' ? 'initial' : 'end',
      };
    }
  }, []);

  const mouseDownHandler = useCallback(
    (event) => {
      if (noPropagation) {
        event.stopPropagation();
      }

      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.x;
      const y = event.clientY - boundingRect.y;
      if (stateValues.step === 'initial' || stateValues.step === 'end') {
        stateValues = {
          startX: x,
          startY: y,
          startScreenX: event.screenX,
          startScreenY: event.screenY,
          boundingRect: event.currentTarget.getBoundingClientRect(),
          step: 'start',
          clientX: event.clientX,
          clientY: event.clientY,
        };
      }

      return false;
    },
    [noPropagation],
  );

  const mouseMoveCallback = (event) => {
    if (stateValues.step === 'start' || stateValues.step === 'moving') {
      const { screenX, screenY } = event;
      stateValues = {
        ...stateValues,
        step: 'moving',
        endX: stateValues.startX + screenX - stateValues.startScreenX,
        endY: stateValues.startY + screenY - stateValues.startScreenY,
      };
      calcSpeed(event);
      const valueRange = maxValue - minValue;
      const positionDiff = stateValues.endX - stateValues.startX;
      const value =
        (Math.abs(positionDiff) * (Math.abs(speedX) > 3 ? valueRange : 5)) /
        stateValues.boundingRect.width;

      onChange({
        value: speedX >= 0 ? valueProps + Math.abs(value) : valueProps - value,
        name,
      });
    }
  };

  const mouseUpCallback = () => {
    if (stateValues.step === 'moving' || stateValues.step === 'start') {
      stateValues = {
        ...stateValues,
        step: stateValues.step === 'start' ? 'initial' : 'end',
      };
    }
  };

  return (
    <div
      style={{ ...styles.container, ...style }}
      className={className}
      onMouseMove={mouseMoveCallback}
      onMouseUp={mouseUpCallback}
      onMouseDown={mouseDownHandler}
      onMouseEnter={mouseEnterHandler}
    >
      <span style={styles.label}>{label}</span>
    </div>
  );
};

InputRange.defaultProps = {
  name: '',
  minValue: 0,
  maxValue: 50,
  value: 0,
  onChange: () => {
    return null;
  },
  label: 'Drag to Change the value',
  noPropagation: true,
};

export default InputRange;

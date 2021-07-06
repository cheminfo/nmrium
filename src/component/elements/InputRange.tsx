import { CSSProperties, useCallback, useImperativeHandle, useRef } from 'react';

import { forwardRefWithAs } from '../../utils';

const styles: Record<'container' | 'label', CSSProperties> = {
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

interface InputRangeProps {
  name: string;
  value?: number;
  onChange: (element: any) => void;
  label?: string;
  style?: CSSProperties;
  className?: string;
}

function InputRange(props: InputRangeProps, ref) {
  const { name, value = 0, onChange, label, style, className } = props;
  const previousPosition = useRef(0);
  const valueRef = useRef(value);

  useImperativeHandle(ref, () => ({
    setValue: (value) => {
      valueRef.current = value;
    },
  }));

  const mouseDownCallback = useCallback(
    (event) => {
      function mouseMoveCallback(event) {
        let diff = event.clientX - previousPosition.current;
        previousPosition.current = event.clientX;
        if (event.buttons === 1) {
          const step = diff / (event.shiftKey ? 10 : 1);
          valueRef.current = valueRef.current + step;
          onChange({
            value: valueRef.current,
            name,
          });
        }
      }

      function mouseUpCallback() {
        window.removeEventListener('mousemove', mouseMoveCallback);
        window.removeEventListener('mouseup', mouseUpCallback);
      }

      previousPosition.current = event.clientX;
      window.addEventListener('mousemove', mouseMoveCallback);
      window.addEventListener('mouseup', mouseUpCallback);
    },
    [name, onChange],
  );

  return (
    <div
      style={{ ...styles.container, ...style }}
      className={className}
      onMouseDown={mouseDownCallback}
    >
      <span style={styles.label}>{label}</span>
    </div>
  );
}

export default forwardRefWithAs(InputRange);

import type { CSSProperties } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

const styles: Record<'container' | 'label', CSSProperties> = {
  container: {
    width: '100%',
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
    paddingLeft: '5px',
    paddingRight: '5px',
  },
};

interface InputRangeProps {
  name: string;
  value?: number;
  onChange: (element: { value: number; name: string }) => void;
  label?: string;
  shortLabel?: string;
  style?: CSSProperties;
  className?: string;
}

// TODO: remove this hacky ref usage.
function InputRange(props: InputRangeProps, ref: any) {
  const {
    name,
    value = 0,
    onChange,
    label,
    shortLabel,
    style,
    className,
  } = props;
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
        const diff = event.clientX - previousPosition.current;
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
        globalThis.removeEventListener('mousemove', mouseMoveCallback);
        globalThis.removeEventListener('mouseup', mouseUpCallback);
      }

      previousPosition.current = event.clientX;
      globalThis.addEventListener('mousemove', mouseMoveCallback);
      globalThis.addEventListener('mouseup', mouseUpCallback);
    },
    [name, onChange],
  );

  return (
    <div
      style={{ ...styles.container, ...style }}
      {...(className && { className })}
      onMouseDown={mouseDownCallback}
    >
      <span className={shortLabel ? 'large-label' : ''} style={styles.label}>
        {label}
      </span>
      {shortLabel && (
        <span className="small-label" style={styles.label}>
          {shortLabel}
        </span>
      )}
    </div>
  );
}

export default forwardRef(InputRange);

import { useRef } from 'react';

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

const previousPosition = { x: 0, nano: performance.now() };

export function InputRange({ name, value, onChange, label, style, className }) {
  const mouseMoveCallback = (event) => {
    let diff = event.clientX - previousPosition.x;
    previousPosition.x = event.clientX;
    if (event.buttons === 1) {
      onChange({
        value: value + diff / (event.shiftKey ? 10 : 1),
        name,
      });
    }
  };

  return (
    <div
      style={{ ...styles.container, ...style }}
      className={className}
      onMouseMove={mouseMoveCallback}
    >
      <span style={styles.label}>{label}</span>
    </div>
  );
}

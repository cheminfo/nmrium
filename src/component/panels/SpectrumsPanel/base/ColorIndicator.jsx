import { memo } from 'react';

function ColorIndicator1D({ color, activated }) {
  return (
    <div
      style={{
        backgroundColor: color,
        height: '12px',
        width: '12px',
        opacity: activated ? 1 : 0.1,
        display: 'inline-block',
      }}
    />
  );
}
function ColorIndicator2D({ positiveColor, negativeColor, activated }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      opacity={activated ? 1 : 0.1}
    >
      <g>
        <path d="M0,0H12L0,12Z" fill={positiveColor} strokeWidth="0" />
        <path d="M12,12H0L12,0Z" fill={negativeColor} strokeWidth="0" />
      </g>
    </svg>
  );
}

function ColorIndicator({ dimension, color, activated, onClick, style }) {
  return (
    <button style={style} type="button" onClick={onClick}>
      {dimension === 2 ? (
        <ColorIndicator2D {...color} activated={activated} />
      ) : (
        <ColorIndicator1D activated={activated} {...color} />
      )}
    </button>
  );
}

export default memo(ColorIndicator);

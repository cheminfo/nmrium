import { Display1D, Display2D } from 'nmr-load-save';
import { CSSProperties, memo } from 'react';

const buttonStyle: CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  width: '20px',
  height: '20px',
  margin: 'auto',
};
interface ColorIndicator1DProps {
  display: Display1D;
}

interface ColorIndicator2DProps {
  display: Display2D;
}

function ColorIndicator1D({ display }: ColorIndicator1DProps) {
  return (
    <div
      style={{
        backgroundColor: display.color,
        height: '12px',
        width: '12px',
        margin: 'auto',
      }}
    />
  );
}

function ColorIndicator2D({ display }: ColorIndicator2DProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ margin: 'auto' }}>
      <g>
        <path d="M0,0H12L0,12Z" fill={display.positiveColor} strokeWidth="0" />
        <path d="M12,12H0L12,0Z" fill={display.negativeColor} strokeWidth="0" />
      </g>
    </svg>
  );
}

interface ColorIndicatorProps {
  onClick: (e: any) => void;
  display: Display1D | Display2D;
  dimension: number;
}

function ColorIndicator(props: ColorIndicatorProps) {
  const { onClick = () => null, display, dimension } = props;

  return (
    <button style={buttonStyle} type="button" onClick={onClick}>
      {dimension === 2 ? (
        <ColorIndicator2D display={display as Display2D} />
      ) : (
        <ColorIndicator1D display={display as Display1D} />
      )}
    </button>
  );
}

export default memo(ColorIndicator);

import { CSSProperties, memo } from 'react';

interface ColorIndicatorNDProps {
  activated: boolean;
}

interface ColorIndicator1DProps extends ColorIndicatorNDProps {
  color: string;
}

interface ColorIndicator2DProps extends ColorIndicatorNDProps {
  positiveColor: string;
  negativeColor: string;
}

function ColorIndicator1D({ color, activated }: ColorIndicator1DProps) {
  return (
    <div
      style={{
        backgroundColor: color,
        height: '12px',
        width: '12px',
        opacity: activated ? 1 : 0.2,
        display: 'inline-block',
      }}
    />
  );
}

function ColorIndicator2D({
  positiveColor,
  negativeColor,
  activated,
}: ColorIndicator2DProps) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      opacity={activated ? 1 : 0.2}
    >
      <g>
        <path d="M0,0H12L0,12Z" fill={positiveColor} strokeWidth="0" />
        <path d="M12,12H0L12,0Z" fill={negativeColor} strokeWidth="0" />
      </g>
    </svg>
  );
}

type ColorIndicatorProps = BaseColorIndicatorProps &
  (
    | {
        dimension: 1;
        color: Omit<ColorIndicator1DProps, 'activated'>;
      }
    | { dimension: 2; color: Omit<ColorIndicator2DProps, 'activated'> }
  );

interface BaseColorIndicatorProps {
  activated: boolean;
  onClick: (e: any) => void;
  style: CSSProperties;
}

function ColorIndicator(props: ColorIndicatorProps) {
  const { style, onClick = () => null, activated, dimension, color } = props;

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

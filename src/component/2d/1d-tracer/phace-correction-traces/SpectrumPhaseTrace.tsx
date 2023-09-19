import { useChartData } from '../../../context/ChartContext';
import { TraceDirection } from '../../../reducer/Reducer';
import { PathBuilder } from '../../../utility/PathBuilder';
import { getYScale } from '../../utilities/SliceScale';
import { get2DXScale, get2DYScale } from '../../utilities/scale';

interface SpectrumPhaseTraceProps {
  data: { x: Float64Array; re: Float64Array };
  position: { x: number; y: number };
  color: string;
  direction: TraceDirection;
}

function usePath(x: Float64Array, y: Float64Array, direction: TraceDirection) {
  const { width, margin, height, xDomain, yDomain } = useChartData();

  if (direction === 'horizontal') {
    const scaleX = get2DXScale({ margin, width, xDomain });
    const scaleY = getYScale(height, y, margin.top + margin.bottom);

    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(scaleX(x[0]), scaleY(y[0]));
    for (let i = 1; i < x.length; i++) {
      pathBuilder.lineTo(scaleX(x[i]), scaleY(y[i]));
    }

    return pathBuilder.toString();
  }

  const scaleX = get2DYScale({ margin, height, yDomain }, true);
  const scaleY = getYScale(width, y, margin.left + margin.right);

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(scaleY(y.at(-1) as number), scaleX(x.at(-1) as number));

  for (let i = x.length - 2; i >= 0; i--) {
    pathBuilder.lineTo(scaleY(y[i]), scaleX(x[i]));
  }

  return pathBuilder.toString();
}

export function SpectrumPhaseTrace(props: SpectrumPhaseTraceProps) {
  const { data, position, color, direction } = props;
  const { width, margin, height } = useChartData();

  const { x, re } = data;
  const path = usePath(x, re, direction);
  const innerheight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const translateY = direction === 'horizontal' ? position.y - innerheight : 0;
  const translateX = direction === 'vertical' ? position.x - innerWidth : 0;

  return (
    <path
      className="line"
      stroke={color}
      strokeWidth="1"
      fill="transparent"
      d={path}
      style={{
        transform: `translate(${translateX}px,${translateY}px) `,
      }}
    />
  );
}

import { useChartData } from '../../../context/ChartContext';
import { TraceDirection } from '../../../reducer/Reducer';
import { PathBuilder } from '../../../utility/PathBuilder';
import { get2DXScale } from '../../utilities/scale';
import { getYScale } from '../../utilities/SliceScale';

interface SpectrumPhaseTraceProps {
  data: { x: Float64Array; re: Float64Array };
  yShift: number;
  color: string;
  direction: TraceDirection;
}

export function SpectrumPhaseTrace(props: SpectrumPhaseTraceProps) {
  const { data, yShift, color, direction } = props;
  const { width, margin, height, xDomain, yDomain } = useChartData();

  const { x, re: y } = data;
  const scaleX = get2DXScale(
    { margin, width, xDomain: direction === 'horizontal' ? xDomain : yDomain },
    direction === 'vertical',
  );
  const scaleY = getYScale(height, y, margin.top + margin.bottom);

  const pathBuilder = new PathBuilder();
  pathBuilder.moveTo(scaleX(x[0]), scaleY(y[0]));
  for (let i = 1; i < x.length; i++) {
    pathBuilder.lineTo(scaleX(x[i]), scaleY(y[i]));
  }

  const clipHeight = height - margin.top - margin.bottom;

  return (
    <path
      className="line"
      stroke={color}
      strokeWidth="1"
      fill="transparent"
      d={pathBuilder.toString()}
      style={{
        transform: `translate(0px,${yShift - clipHeight}px)`,
      }}
    />
  );
}

import { NmrData1D } from 'cheminfo-types';

import { useChartData } from '../../context/ChartContext';
import { PathBuilder } from '../../utility/PathBuilder';
import { useScale2DX, getSliceYScale } from '../utilities/scale';

interface BaseProps {
  vericalMargin?: number;
  reverse?: boolean;
}
interface HorizontalSliceChartProps extends BaseProps {
  data: NmrData1D;
}

interface UsePathOptions extends BaseProps {
  height?: number;
}

function usePath(data: NmrData1D, options: UsePathOptions) {
  const { height = 100, vericalMargin = 10 } = options;
  const { mode } = useChartData();
  const scaleX = useScale2DX();

  if (!data) return '';

  const { x, re: y } = data;

  const scaleY = getSliceYScale(y, height, mode, { margin: vericalMargin });

  const pathBuilder = new PathBuilder();
  pathBuilder.moveTo(scaleX(x[0]), scaleY(y[0]));
  for (let i = 1; i < x.length; i++) {
    pathBuilder.lineTo(scaleX(x[i]), scaleY(y[i]));
  }

  return pathBuilder.toString();
}

function HorizontalSliceChart(props: HorizontalSliceChartProps) {
  const { vericalMargin = 10, data, reverse = false } = props;
  const { width, margin, displayerKey } = useChartData();
  const height = margin.top;

  const path = usePath(data, { height, reverse, vericalMargin });

  const innerWidth = width - margin.left - margin.right;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <clipPath id={`${displayerKey}clip-top`}>
          <rect width={innerWidth} height={height} x={margin.left} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-top)`}>
        <path className="line" stroke="red" fill="none" d={path} />
      </g>
    </svg>
  );
}

export default HorizontalSliceChart;

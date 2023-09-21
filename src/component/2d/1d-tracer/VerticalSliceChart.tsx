import { NmrData1D } from 'cheminfo-types';

import { useChartData } from '../../context/ChartContext';
import { PathBuilder } from '../../utility/PathBuilder';
import { getScale } from '../utilities/SliceScale';
import { get2DYScale } from '../utilities/scale';

interface BaseProps {
  reverse?: boolean;
  horizontalMargin?: number;
}

interface VerticalSliceChartProps extends BaseProps {
  data: NmrData1D;
}

interface usePathOptions extends BaseProps {
  width?: number;
}

function usePath(data, props: usePathOptions) {
  const { reverse = false, width = 100, horizontalMargin = 10 } = props;
  const { height, margin, yDomain } = useChartData();

  if (!data) return '';
  const { x, re: y } = data;
  const scaleX = get2DYScale({ height, margin, yDomain }, reverse);

  const scaleY = getScale(width, y, horizontalMargin);

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(scaleY(y[0]), scaleX(x[0]));

  for (let i = 1; i < x.length; i++) {
    pathBuilder.lineTo(scaleY(y[i]), scaleX(x[i]));
  }

  return pathBuilder.toString();
}

function VerticalSliceChart(props: VerticalSliceChartProps) {
  const { horizontalMargin = 10, data, reverse = false } = props;
  const { height, margin, displayerKey } = useChartData();

  const width = margin.left;

  const path = usePath(data, { width, horizontalMargin, reverse });

  const innerHeight = height - margin.bottom - margin.top;

  return (
    <svg viewBox={`0 0 ${height} ${height}`} width={height} height={height}>
      <defs>
        <clipPath id={`${displayerKey}clip-left`}>
          <rect width={height} height={innerHeight} x="0" y={margin.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-left)`}>
        <path className="line" stroke="red" fill="none" d={path} />
      </g>
    </svg>
  );
}

export default VerticalSliceChart;

import { useChartData } from '../../context/ChartContext';
import useIntegralPath from '../utilities/useIntegralPath';

interface IntegralProps {
  range: { id: string; from: number; to: number; integral?: number };
}

function RangeIntegral({ range }: IntegralProps) {
  const path = useIntegralPath(range);
  const { height, margin } = useChartData();

  return (
    <path
      className="line"
      stroke="black"
      strokeWidth="1"
      fill="none"
      style={{
        transform: `translateY(-${margin.bottom + height * 0.3}px)`,
      }}
      d={path}
    />
  );
}

export default RangeIntegral;

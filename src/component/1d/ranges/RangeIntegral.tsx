import { useChartData } from '../../context/ChartContext';
import useIntegralPath from '../utilities/useIntegralPath';

interface IntegralProps {
  range: { id: string; from: number; to: number; integral?: number };
}

function RangeIntegral({ range }: IntegralProps) {
  const path = useIntegralPath(range, {
    useActiveSpectrum: true,
    useConstantScale: true,
  });
  const { height } = useChartData();

  return (
    <path
      className="line"
      stroke="black"
      strokeWidth="1"
      fill="none"
      style={{
        transformOrigin: 'center center',
        transform: `translateY(-${height / 4}px)`,
      }}
      d={path}
    />
  );
}

export default RangeIntegral;

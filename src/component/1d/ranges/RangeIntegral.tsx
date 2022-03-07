import useIntegralPath from '../../hooks/useIntegralPath';

interface IntegralProps {
  range: { id: string; from: number; to: number; integral?: number };
}

function RangeIntegral({ range }: IntegralProps) {
  const path = useIntegralPath(range);

  return (
    <path
      className="line"
      stroke="black"
      strokeWidth="1"
      fill="none"
      d={path}
    />
  );
}

export default RangeIntegral;

import { useChartData } from '../../context/ChartContext.js';

export function ClipPathContainer({ children }) {
  const { displayerKey } = useChartData();

  return <g clipPath={`url(#${displayerKey}clip-chart)`}>{children}</g>;
}

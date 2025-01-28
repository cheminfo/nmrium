import { useInsetOptions } from '../../1d/inset/InsetProvider.js';
import { useChartData } from '../../context/ChartContext.js';

export function ClipPathContainer({ children }) {
  const { displayerKey } = useChartData();
  const { id: insetKey = 'primary' } = useInsetOptions() || {};

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-${insetKey})`}>{children}</g>
  );
}

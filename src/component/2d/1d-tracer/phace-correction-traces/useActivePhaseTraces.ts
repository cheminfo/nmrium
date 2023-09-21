import { COLORS } from '../../../../data/utilities/generateColor';
import { useChartData } from '../../../context/ChartContext';

export function useActivePhaseTraces() {
  const {
    toolOptions: {
      data: {
        twoDimensionPhaseCorrection: { traces, activeTraceDirection },
      },
    },
  } = useChartData();
  const color = activeTraceDirection === 'horizontal' ? COLORS[0] : COLORS[1];
  return {
    ...traces[activeTraceDirection],
    activeTraceDirection,
    color,
  };
}

import { COLORS } from '../../../../data/utilities/generateColor.js';
import { useChartData } from '../../../context/ChartContext.js';

export function useActivePhaseTraces() {
  const {
    toolOptions: {
      data: {
        twoDimensionPhaseCorrection: {
          traces,
          activeTraceDirection,
          addTracesToBothDirections,
        },
      },
    },
  } = useChartData();
  const color = activeTraceDirection === 'horizontal' ? COLORS[0] : COLORS[1];
  return {
    ...traces[activeTraceDirection],
    activeTraceDirection,
    color,
    addTracesToBothDirections,
  };
}

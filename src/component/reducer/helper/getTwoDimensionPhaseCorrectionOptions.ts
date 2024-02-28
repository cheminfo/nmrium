import type { Draft } from 'immer';

import { useChartData } from '../../context/ChartContext';
import type {
  PhaseCorrectionTraceData,
  State,
  TraceDirection,
  TwoDimensionPhaseCorrection,
} from '../Reducer';

export function getTwoDimensionPhaseCorrectionOptions(
  state: Draft<State> | State,
): Draft<
  TwoDimensionPhaseCorrection & { activeTraces: PhaseCorrectionTraceData }
> {
  const {
    toolOptions: {
      data: {
        twoDimensionPhaseCorrection: { traces, activeTraceDirection },
      },
    },
  } = state;
  return {
    activeTraces: traces[activeTraceDirection],
    traces,
    activeTraceDirection,
  };
}

export function useTwoDimensionPhaseCorrectionOptions(
  direction: TraceDirection,
) {
  const {
    toolOptions: {
      data: {
        twoDimensionPhaseCorrection: { traces },
      },
    },
  } = useChartData();
  return traces[direction];
}

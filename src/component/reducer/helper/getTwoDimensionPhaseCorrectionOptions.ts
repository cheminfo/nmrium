import type { Draft } from 'immer';

import type {
  PhaseCorrectionTraceData,
  State,
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

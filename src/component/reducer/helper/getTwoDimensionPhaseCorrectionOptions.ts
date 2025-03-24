import type { Draft } from 'immer';

import type {
  PhaseCorrectionTraceData,
  State,
  TwoDimensionPhaseCorrection,
} from '../Reducer.js';

export function getTwoDimensionPhaseCorrectionOptions(
  state: Draft<State> | State,
): Draft<
  TwoDimensionPhaseCorrection & { activeTraces: PhaseCorrectionTraceData }
> {
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
  } = state;
  return {
    activeTraces: traces[activeTraceDirection],
    traces,
    activeTraceDirection,
    addTracesToBothDirections,
  };
}

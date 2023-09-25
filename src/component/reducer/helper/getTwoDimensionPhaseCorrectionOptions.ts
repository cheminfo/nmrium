import { Draft } from 'immer';

import { State } from '../Reducer';

export function getTwoDimensionPhaseCorrectionOptions(
  state: Draft<State> | State,
) {
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

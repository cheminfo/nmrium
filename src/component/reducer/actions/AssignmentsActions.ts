import type { Range, Zone } from '@zakodium/nmr-types';
import type { Spectrum1D, Spectrum2D } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import type { SpectraData1D, SpectraData2D } from 'nmr-processing';

import type { State } from '../Reducer.js';
import type { ActionType } from '../types/ActionType.js';

type SetAutomaticAssignmentsAction = ActionType<
  'SET_AUTOMATIC_ASSIGNMENTS',
  { assignments: Array<SpectraData1D | SpectraData2D> }
>;

export type AssignmentsActions = SetAutomaticAssignmentsAction;

function handleSetAutomaticAssignments(
  draft: Draft<State>,
  action: SetAutomaticAssignmentsAction,
) {
  const assignments = action.payload.assignments;

  for (const datum of assignments) {
    const index = draft.data.findIndex((spectrum) => spectrum.id === datum.id);
    if (index !== -1) {
      const dimension = draft.data[index].info.dimension;
      if (dimension === 1) {
        (draft.data[index] as Spectrum1D).ranges.values = (
          datum as SpectraData1D
        ).ranges as Range[];
      } else if (dimension === 2) {
        (draft.data[index] as Spectrum2D).zones.values = (
          datum as SpectraData2D
        ).zones as Zone[];
      }
    }
  }
}

export { handleSetAutomaticAssignments };

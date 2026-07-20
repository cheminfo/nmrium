import type { Range, Zone } from '@zakodium/nmr-types';
import { isSpectrum1D, isSpectrum2D } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import type { SpectraData1D, SpectraData2D } from 'nmr-processing';

import type { State } from '../Reducer.js';
import { getSpectrum } from '../helper/getSpectrum.js';
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
    const spectrum = getSpectrum(draft, datum.id);
    if (isSpectrum1D(spectrum)) {
      spectrum.ranges.values = (datum as SpectraData1D).ranges as Range[];
    } else if (isSpectrum2D(spectrum)) {
      spectrum.zones.values = (datum as SpectraData2D).zones as Zone[];
    }
  }
}

export { handleSetAutomaticAssignments };

import { Draft } from 'immer';
import type { Range, Spectrum1D, Spectrum2D, Zone } from 'nmr-processing';
import { SpectraData1D, SpectraData2D } from 'nmr-processing';

import { State } from '../Reducer';

function setAutomaticAssignmentsHandler(
  draft: Draft<State>,
  action: { payload: { assignments: (SpectraData1D | SpectraData2D)[] } },
) {
  const assignments = action.payload.assignments;

  for (let datum of assignments) {
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

export { setAutomaticAssignmentsHandler };

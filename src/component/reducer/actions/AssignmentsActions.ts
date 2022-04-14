import { Draft } from 'immer';
import { SpectraData1D, SpectraData2D } from 'nmr-processing';

import { Datum1D, Range } from '../../../data/types/data1d';
import { Datum2D, Zone } from '../../../data/types/data2d';
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
        (draft.data[index] as Datum1D).ranges.values = (datum as SpectraData1D)
          .ranges as Range[];
      } else if (dimension === 2) {
        (draft.data[index] as Datum2D).zones.values = (datum as SpectraData2D)
          .zones as Zone[];
      }
    }
  }
}

export { setAutomaticAssignmentsHandler };

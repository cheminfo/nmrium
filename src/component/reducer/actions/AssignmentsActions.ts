/* eslint-disable @typescript-eslint/no-unused-vars */
import { Draft } from 'immer';
import { SpectraDataWithIds } from 'nmr-processing/lib/assignment/utils/getAssignment/checkIDs';

import { State } from '../Reducer';

function setAutomaticAssignmentsHandler(
  draft: Draft<State>,
  action: { payload: { data: SpectraDataWithIds } },
) {
  //   const assignmentData = action.payload.data;
  //   for (let datum of assignmentData) {
  //   }
}

export { setAutomaticAssignmentsHandler };

import type { Range } from 'nmr-processing';
import { RangeUtilities } from 'nmr-processing';

const {
  unlink,
  getDiaIDs,
  getNbAtoms,
  setNbAtoms,
  resetDiaIDs,
  addDefaultSignal,
  checkRangeKind,
  checkSignalKinds,
} = RangeUtilities;

function unlinkInAssignmentData(assignmentData, ranges: Partial<Range>[]) {
  const ids = ranges.flatMap((range) => {
    if (range.id) {
      return range.id;
    }
    if (range.signals) {
      return range.signals.map((signal) => signal.id);
    }
    return [];
  });

  assignmentData.dispatch({
    type: 'REMOVE',
    payload: { ids, axis: 'x' },
  });
}

export {
  unlinkInAssignmentData,
  unlink,
  getDiaIDs,
  getNbAtoms,
  setNbAtoms,
  resetDiaIDs,
  addDefaultSignal,
  checkRangeKind,
  checkSignalKinds,
};

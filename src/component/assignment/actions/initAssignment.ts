import { Spectrum } from 'nmr-load-save';
import { Ranges, Zones } from 'nmr-processing';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { assignmentState, AssignmentState, Axis } from '../AssignmentsContext';

export default function initAssignment(action) {
  const newState = {
    ...assignmentState,
  };

  const spectra = (action.payload.spectra || []) as Spectrum[];
  for (const spectrum of spectra) {
    if (isSpectrum1D(spectrum)) {
      setRangesAssignments(newState, spectrum.ranges);
    } else {
      setZonesAssignments(newState, spectrum.zones);
    }
  }
  return newState;
}

function setRangesAssignments(state: AssignmentState, ranges: Ranges) {
  const diaIDRecords: Array<{ id: string; diaIDs: string[] }> = [];
  for (const { id, diaIDs, signals } of ranges.values) {
    diaIDRecords.push({ id, diaIDs: diaIDs || [] });
    for (const signal of signals) {
      diaIDRecords.push({ id: signal.id, diaIDs: signal.diaIDs || [] });
    }
  }
  for (const { id, diaIDs } of diaIDRecords) {
    for (const diaID of diaIDs) {
      setAssignment(state, id, 'x', diaID);
    }
  }
}
function setZonesAssignments(state: AssignmentState, zones: Zones) {
  const diaIDRecords = zones.values.flatMap(({ id, x, y, signals }) => {
    const diaIDRecords = signals.map((signal) => ({
      id: signal.id,
      diaIDs: { x: signal.x.diaIDs || [], y: signal.y.diaIDs || [] },
    }));

    return [
      { id, diaIDs: { x: x.diaIDs || [], y: y.diaIDs || [] } },
      ...diaIDRecords,
    ];
  });

  for (const { id, diaIDs } of diaIDRecords) {
    for (const axis of ['x', 'y'] as Axis[]) {
      for (const diaID of diaIDs[axis]) {
        setAssignment(state, id, axis, diaID);
      }
    }
  }
}

function setAssignment(state: AssignmentState, id, axis: Axis, diaID: string) {
  if (
    Array.isArray(state.assignments?.[id]?.[axis]) &&
    !state.assignments[id][axis].includes(diaID)
  ) {
    state.assignments[id][axis].push(diaID);
  } else {
    state.assignments = {
      ...state.assignments,
      [id]: { ...state.assignments[id], [axis]: [diaID] },
    };
  }
}

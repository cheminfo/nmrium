import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { Datum1D } from '../../../data/types/data1d';
import { Ranges } from '../../../data/types/data1d/Ranges';
import { Datum2D, Zones } from '../../../data/types/data2d';
import { assignmentState, AssignmentState, Axis } from '../AssignmentsContext';

export default function initAssignment(action) {
  const newState = {
    ...assignmentState,
  };

  const spectra = (action.payload.spectra || []) as (Datum1D | Datum2D)[];
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
  const diaIDRecords = zones.values
    .map(({ id, x, y, signals }) => {
      const diaIDRecords = signals.map((signal) => ({
        id: signal.id,
        diaIDs: { x: signal.x.diaIDs || [], y: signal.y.diaIDs || [] },
      }));

      return [
        { id, diaIDs: { x: x.diaIDs || [], y: y.diaIDs || [] } },
        ...diaIDRecords,
      ];
    })
    .flat();

  for (const { id, diaIDs } of diaIDRecords) {
    (['x', 'y'] as Axis[]).forEach((axis) => {
      for (const diaID of diaIDs[axis]) {
        setAssignment(state, id, axis, diaID);
      }
    });
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

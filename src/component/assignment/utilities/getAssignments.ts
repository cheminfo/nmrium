import type { Ranges, Zones } from '@zakodium/nmr-types';
import type { Spectrum } from '@zakodium/nmrium-core';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import type { Assignments, Axis } from '../AssignmentsContext.js';

export function getAssignments(spectra: Spectrum[]) {
  const assignments: Assignments = {};

  for (const spectrum of spectra) {
    if (isSpectrum1D(spectrum)) {
      setRangesAssignments(assignments, spectrum.ranges);
    } else {
      setZonesAssignments(assignments, spectrum.zones);
    }
  }

  return assignments;
}

function setRangesAssignments(assignments: Assignments, ranges: Ranges) {
  const diaIDRecords: Array<{ id: string; diaIDs: string[] }> = [];
  for (const { signals } of ranges.values) {
    for (const signal of signals) {
      diaIDRecords.push({ id: signal.id, diaIDs: signal.diaIDs || [] });
    }
  }
  for (const { id, diaIDs } of diaIDRecords) {
    for (const diaID of diaIDs) {
      setAssignment(assignments, id, 'x', diaID);
    }
  }
}
function setZonesAssignments(assignments: Assignments, zones: Zones) {
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
        setAssignment(assignments, id, axis, diaID);
      }
    }
  }
}

function setAssignment(
  assignments: Assignments,
  id: any,
  axis: Axis,
  diaID: string,
) {
  if (!assignments[id]) {
    assignments[id] = { x: [], y: [] };
  }

  if (!assignments[id][axis].includes(diaID)) {
    assignments[id][axis].push(diaID); // Push the new diaID
  }
}

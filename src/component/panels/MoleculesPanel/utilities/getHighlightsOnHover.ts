import type { Spectrum } from '@zakodium/nmrium-core';

import { assignmentAxes } from '../../../assignment/AssignmentsContext.js';
import type { AssignmentContext } from '../../../assignment/AssignmentsContext.ts';

import { getAssignIds } from './getAssignIds.ts';

export function getHighlightsOnHover(
  assignments: AssignmentContext,
  oclIDs: string[],
  spectra: Spectrum[],
) {
  // set all IDs to highlight when hovering over an atom from AssignKey data
  let highlights: string[] = [];
  const assignmentsByKey = assignments.data;

  for (const key in assignmentsByKey) {
    const assignments = assignmentsByKey[key];
    for (const axis of assignmentAxes) {
      if (assignments[axis]?.some((oclKey: any) => oclIDs.includes(oclKey))) {
        highlights = highlights.concat(assignments[axis]);
        for (const spectrum of spectra) {
          const assignIds = getAssignIds(spectrum, key);
          if (!assignIds) {
            continue;
          }

          const ids = assignIds.map<string>((item) => item.key);
          highlights.push(...ids);
        }
      }
    }
  }

  return highlights;
}

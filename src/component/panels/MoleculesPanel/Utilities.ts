import type { Range, Zone } from '@zakodium/nmr-types';
import type { Spectrum } from '@zakodium/nmrium-core';
import type { DiaIDAndInfo } from 'openchemlib-utils';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import type {
  AssignmentContext,
  Axis,
} from '../../assignment/AssignmentsContext.js';
import { assignmentAxes } from '../../assignment/AssignmentsContext.js';

interface TargetAssignment {
  key: string;
  index: number;
}

interface RangeTargetAssignKey extends TargetAssignment {
  target: 'range';
}
interface ZoneTargetAssignKey extends TargetAssignment {
  target: 'zone';
}
interface SignalTargetAssignKey extends TargetAssignment {
  target: 'signal';
}
export type TargetAssignKeys =
  | [RangeTargetAssignKey | ZoneTargetAssignKey]
  | [RangeTargetAssignKey | ZoneTargetAssignKey, SignalTargetAssignKey];

export interface AtomData {
  oclIDs: string[];
  nbAtoms: number;
}

function getElements(activeTab: string) {
  if (!activeTab) return;

  const nuclei = activeTab.split(',');
  return nuclei.map((nucleus) => nucleus.replaceAll(/\d/g, ''));
}

/**
 * Returns the OCL id(s) and number of atoms of an atom when hovering over
 * or clicking on it. This is depending on an optional given axis.
 * In case of an heavy atom with bonded hydrogens the OCL id(s)
 * and number of these hydrogens are added as well.
 *
 * @param {DiaIDAndInfo} diaIDAndInfo - atom returned by OCLnmr component
 * @param {string} activeTab - active tab
 * @param {Axis} axis - current axis
 *
 */
export function extractFromAtom(
  diaIDAndInfo: DiaIDAndInfo | undefined,
  activeTab: string,
  axis?: Axis | null,
): AtomData {
  const elements = getElements(activeTab);

  if (elements && elements.length > 0 && diaIDAndInfo) {
    const dim = axis === 'x' ? 0 : axis === 'y' ? 1 : null;
    switch (dim !== null && elements[dim]) {
      case diaIDAndInfo.atomLabel: {
        // take always oclID if atom type is same as element of activeTab)
        return {
          oclIDs: [diaIDAndInfo.idCode],
          nbAtoms: diaIDAndInfo.nbEquivalentAtoms,
        };
      }
      case 'H': {
        // if we are in proton spectrum and use then the IDs of attached hydrogens of an atom
        return {
          oclIDs: diaIDAndInfo.attachedHydrogensIDCodes,
          nbAtoms:
            diaIDAndInfo.nbEquivalentAtoms * diaIDAndInfo.nbAttachedHydrogens,
        };
      }
      default:
        return {
          oclIDs: [diaIDAndInfo.idCode].concat(
            diaIDAndInfo.attachedHydrogensIDCodes,
          ),
          nbAtoms:
            diaIDAndInfo.nbEquivalentAtoms +
            diaIDAndInfo.nbEquivalentAtoms * diaIDAndInfo.nbAttachedHydrogens,
        };
    }
  }

  return { oclIDs: [], nbAtoms: 0 };
}

function getRangesOrZones(spectrum: Spectrum): Array<Range | Zone> {
  if (isSpectrum1D(spectrum)) {
    return spectrum.ranges.values;
  } else {
    return spectrum.zones.values;
  }
}

export function getAssignIds(
  spectrum: Spectrum,
  id: string,
): TargetAssignKeys | null {
  if (!spectrum) return null;

  const data = getRangesOrZones(spectrum);
  const target = isSpectrum1D(spectrum) ? 'range' : 'zone';

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];

    if (datum.id === id) {
      return [{ target, index: i, key: datum.id }];
    }

    const signalIndex = datum.signals.findIndex((signal) => signal.id === id);
    if (signalIndex !== -1) {
      const { id } = datum.signals[signalIndex];
      return [
        { target, index: i, key: datum.id },
        { target: 'signal', index: signalIndex, key: id },
      ];
    }
  }

  return null;
}

export function getHighlightsOnHover(
  assignments: AssignmentContext,
  oclIDs: any,
  spectrum: any,
) {
  // set all IDs to highlight when hovering over an atom from AssignKey data
  let highlights: string[] = [];
  const assignmentsByKey = assignments.data;

  for (const key in assignmentsByKey) {
    const assignments = assignmentsByKey[key];

    for (const axis of assignmentAxes) {
      if (assignments[axis]?.some((oclKey: any) => oclIDs.includes(oclKey))) {
        highlights = highlights.concat(assignments[axis]);
        const assignIds = getAssignIds(spectrum, key);
        if (assignIds) {
          const ids = assignIds.map<string>((item) => item.key);
          highlights.push(...ids);
        }
      }
    }
  }

  return highlights;
}

export function getCurrentDiaIDsToHighlight(assignmentData: AssignmentContext) {
  const { highlighted, data } = assignmentData;
  const assignment = highlighted ? data[highlighted.id] : null;
  const axisHover = highlighted ? highlighted.axis : null;

  if (axisHover && assignment?.[axisHover]) {
    return assignment[axisHover];
  } else {
    return (assignment?.x || []).concat(assignment?.y || []);
  }
}
/** */
export function getUniqueDiaIDs(diaIDs: string[], atomInformation: AtomData) {
  // a previous version of the code prevented to assign many time the same atom
  // see revision cc13abc18f77b6787b923e3c4edaef51750d9e90
  const { nbAtoms, oclIDs } = atomInformation;

  const diaIDSet = new Set(diaIDs);
  let tempNbAtoms: number = nbAtoms;

  for (const oclID of oclIDs) {
    if (diaIDSet.has(oclID)) {
      tempNbAtoms *= -1;
      diaIDSet.delete(oclID);
    } else {
      diaIDSet.add(oclID);
    }
  }
  return { diaIDs: Array.from(diaIDSet), nbAtoms: tempNbAtoms };
}

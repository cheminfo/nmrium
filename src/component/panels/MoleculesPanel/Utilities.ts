import { Range, Zone } from 'nmr-processing';
import { DiaIDAndInfo } from 'openchemlib-utils';

import { AssignmentContext, Axis } from '../../assignment/AssignmentsContext';

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

export function findDatumAndSignalIndex(data: Array<Range | Zone>, id: string) {
  // if datum could be found then the id is on range/zone level
  let datum = data.find((_datum) => _datum.id === id);
  let signalIndex;
  if (!datum) {
    // figure out the datum via id
    for (const record of data) {
      signalIndex = record.signals.findIndex((signal) => signal.id === id);
      if (signalIndex >= 0) {
        datum = record;
        break;
      }
    }
  }

  return { datum, signalIndex };
}

export function getHighlightsOnHover(
  assignments: AssignmentContext,
  oclIDs,
  data,
) {
  // set all IDs to highlight when hovering over an atom from assignment data
  let highlights: string[] = [];
  const assignmentsByKey = assignments.data.assignments;

  for (const key in assignmentsByKey) {
    const assignments = assignmentsByKey[key];

    for (const axis in assignments) {
      if (assignments[axis]?.some((oclKey) => oclIDs.includes(oclKey))) {
        highlights = highlights.concat(assignments[axis]);
        const { datum, signalIndex } = findDatumAndSignalIndex(data, key);

        if (datum) {
          highlights.push(datum.id);
          if (signalIndex !== undefined) {
            highlights.push(datum.signals[signalIndex].id);
          }
        }
      }
    }
  }

  return highlights;
}

export function getCurrentDiaIDsToHighlight(assignmentData: AssignmentContext) {
  const { highlighted, assignments } = assignmentData.data;
  const assignment = highlighted ? assignments[highlighted.id] : null;
  const axisHover = highlighted ? highlighted.axis : null;

  if (axisHover && assignment?.[axisHover]) {
    return assignment[axisHover];
  } else {
    return (assignment?.x || []).concat(assignment?.y || []);
  }
}

export function toggleDiaIDs(diaIDs: string[], atomInformation: AtomData) {
  let _diaIDs: string[] = diaIDs ? diaIDs.slice() : [];
  const { nbAtoms, oclIDs } = atomInformation;
  let tempNbAtoms: number = nbAtoms;
  for (const oclID of oclIDs) {
    if (_diaIDs.includes(oclID)) {
      tempNbAtoms *= -1;
      _diaIDs = _diaIDs.filter((_id) => _id !== oclID);
    } else {
      _diaIDs.push(oclID);
    }
  }
  return { diaIDs: _diaIDs, nbAtoms: tempNbAtoms };
}

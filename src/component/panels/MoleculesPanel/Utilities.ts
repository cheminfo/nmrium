import { Range } from '../../../data/types/data1d';
import { Zone } from '../../../data/types/data2d';
import { AssignmentContext, Axis } from '../../assignment/AssignmentsContext';

export interface Atom {
  oclID: string;
  atomLabel: string;
  nbAtoms: number;
  nbHydrogens: number;
  hydrogenOCLIDs: string[];
}
export interface AtomData {
  oclIDs: string[];
  nbAtoms: number;
}

function getElements(activeTab: string) {
  const nuclei = activeTab.split(',');
  return nuclei.map((nucleus) => nucleus.replace(/\d/g, ''));
}

/**
 * Returns the OCL id(s) and number of atoms of an atom when hovering over
 * or clicking on it. This is depending on an optional given axis.
 * In case of an heavy atom with bonded hydrogens the OCL id(s)
 * and number of these hydrogens are added as well.
 *
 * @param {Atom} atom - atom returned by OCLnmr component
 * @param {string} activeTab - active tab
 * @param {Axis} axis - current axis
 *
 */
export function extractFromAtom(
  atom: Atom,
  activeTab: string,
  axis?: Axis | null,
): AtomData {
  const elements = getElements(activeTab);

  if (elements.length > 0 && Object.keys(atom).length > 0) {
    const dim = axis === 'x' ? 0 : axis === 'y' ? 1 : null;
    switch (dim !== null && elements[dim]) {
      case atom.atomLabel: {
        // take always oclID if atom type is same as element of activeTab)
        return { oclIDs: [atom.oclID], nbAtoms: atom.nbAtoms };
      }
      case 'H': {
        // if we are in proton spectrum and use then the IDs of attached hydrogens of an atom
        return {
          oclIDs: atom.hydrogenOCLIDs,
          nbAtoms: atom.nbAtoms * atom.nbHydrogens,
        };
      }
      default:
        return {
          oclIDs: [atom.oclID].concat(atom.hydrogenOCLIDs),
          nbAtoms: atom.nbAtoms + atom.nbAtoms * atom.nbHydrogens,
        };
    }
  }

  return { oclIDs: [], nbAtoms: 0 };
}

export function findDatumAndSignalIndex(data: (Range | Zone)[], id: string) {
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

  if (axisHover && assignment && assignment[axisHover]) {
    return assignment[axisHover];
  } else {
    return (assignment?.x || []).concat(assignment?.y || []);
  }
}

export function toggleDiaIDs(diaIDs: string[], atomInformation: AtomData) {
  let _diaIDs = diaIDs ? diaIDs.slice() : [];
  const { nbAtoms, oclIDs } = atomInformation;
  let tempNbAtoms = nbAtoms;
  for (const oclID of oclIDs) {
    if (_diaIDs.includes(oclID)) {
      tempNbAtoms *= -1;
      _diaIDs = _diaIDs.filter((_id) => _id !== oclID);
    } else {
      _diaIDs.push(oclID);
    }
  }
  return [_diaIDs, tempNbAtoms];
}

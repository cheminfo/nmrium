import type { DiaIDAndInfo } from 'openchemlib-utils';

import type { Axis } from '../../../assignment/AssignmentsContext.js';

import type { AtomData } from './AtomData.js';

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

function getElements(activeTab: string) {
  if (!activeTab) return;

  const nuclei = activeTab.split(',');
  return nuclei.map((nucleus) => nucleus.replaceAll(/\d/g, ''));
}

import { DISPLAYER_MODE } from '../../reducer/core/Constants';

export function extractFromAtom(atom, elements, activeAxis) {
  if (elements.length > 0 && Object.keys(atom).length > 0) {
    const dim = activeAxis === 'x' ? 0 : activeAxis === 'y' ? 1 : undefined;
    if (dim !== undefined) {
      if (elements[dim] === atom.atomLabel) {
        // take always oclID if atom type is same as element of activeTab)
        return { oclIDs: [atom.oclID], nbAtoms: atom.nbAtoms };
      }
      if (elements[dim] === 'H') {
        // if we are in proton spectrum and use then the IDs of attached hydrogens of an atom
        return {
          oclIDs: atom.hydrogenOCLIDs,
          nbAtoms: atom.nbAtoms * atom.nbHydrogens,
        };
      }
    } else {
      return {
        oclIDs: [atom.oclID].concat(atom.hydrogenOCLIDs),
        nbAtoms: atom.nbAtoms + atom.nbAtoms * atom.nbHydrogens,
      };
    }
  }

  return { oclIDs: [], nbAtoms: 0 };
}

export function findDatumAndSignalIndex(spectraData, id) {
  // if datum could be found then the id is on range/zone level
  let datum = spectraData.find((_datum) => _datum.id === id);
  let signalIndex;
  if (!datum) {
    // figure out the datum via id
    for (let i = 0; i < spectraData.length; i++) {
      signalIndex = spectraData[i].signal.findIndex(
        (_signal) => _signal.id === id,
      );
      if (signalIndex >= 0) {
        datum = spectraData[i];
        break;
      }
    }
  }

  return { datum, signalIndex };
}

export function getHighlightsOnHover(assignmentData, oclIDs, spectraData) {
  // set all IDs to highlight when hovering over an atom from assignment data
  let highlights = [];
  for (let key in assignmentData.assignment.assignment) {
    let datum, signalIndex;
    let stop = false;
    if (
      assignmentData.assignment.assignment[key].x &&
      assignmentData.assignment.assignment[key].x.some((_assigned) =>
        oclIDs.includes(_assigned),
      )
    ) {
      highlights = highlights.concat(
        assignmentData.assignment.assignment[key].x,
      );
      const result = findDatumAndSignalIndex(spectraData, key);
      datum = result.datum;
      signalIndex = result.signalIndex;
      stop = true;
    }
    if (
      assignmentData.assignment.assignment[key].y &&
      assignmentData.assignment.assignment[key].y.some((_assigned) =>
        oclIDs.includes(_assigned),
      )
    ) {
      highlights = highlights.concat(
        assignmentData.assignment.assignment[key].y,
      );
      const result = findDatumAndSignalIndex(spectraData, key);
      datum = result.datum;
      signalIndex = result.signalIndex;
      stop = true;
    }
    if (datum) {
      highlights.push(datum.id);
      if (signalIndex !== undefined) {
        highlights.push(datum.signal[signalIndex].id);
      }
    }
    if (stop) {
      break;
    }
  }
  return highlights;
}

export function getCurrentDiaIDsToHighlight(assignmentData, displayerMode) {
  const assignmentOnHover = assignmentData.assignment.isOnHover
    ? assignmentData.assignment.assignment[assignmentData.assignment.onHoverID]
    : null;

  const axisOnHover = assignmentData.assignment.isOnHover
    ? assignmentData.assignment.onHoverAxis
    : null;

  return assignmentOnHover
    ? displayerMode === DISPLAYER_MODE.DM_1D
      ? assignmentOnHover.x || []
      : displayerMode === DISPLAYER_MODE.DM_2D
      ? axisOnHover
        ? axisOnHover === 'x'
          ? assignmentOnHover.x || []
          : axisOnHover === 'y'
          ? assignmentOnHover.y || []
          : (assignmentOnHover.x || []).concat(assignmentOnHover.y || [])
        : (assignmentOnHover.x || []).concat(assignmentOnHover.y || [])
      : []
    : [];
}

export function toggleDiaIDs(diaID, atomInformation) {
  let _diaID = diaID ? diaID.slice() : [];
  if (atomInformation.oclIDs.length === 1) {
    if (_diaID.includes(atomInformation.oclIDs[0])) {
      _diaID = _diaID.filter((_id) => _id !== atomInformation.oclIDs[0]);
    } else {
      for (let i = 0; i < atomInformation.nbAtoms; i++) {
        _diaID.push(atomInformation.oclIDs[0]);
      }
    }
  } else if (atomInformation.oclIDs.length > 1) {
    atomInformation.oclIDs.forEach((_oclID) => {
      if (_diaID.includes(_oclID)) {
        _diaID = _diaID.filter((_id) => _id !== _oclID);
      } else {
        _diaID.push(_oclID);
      }
    });
  }
  return _diaID;
}

import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Range } from '../../../data/types/data1d';
import { Zone } from '../../../data/types/data2d';
import { ConcatenationString } from '../../../data/utilities/Concatenation';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { HighlightedSource, useHighlightData } from '../../highlight';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import { SET_DIAID_RANGE, SET_DIAID_ZONE } from '../../reducer/types/Types';

import {
  Atom,
  AtomData,
  extractFromAtom,
  findDatumAndSignalIndex,
  getCurrentDiaIDsToHighlight,
  getHighlightsOnHover,
  toggleDiaIDs,
} from './Utilities';

export default function useAtomAssignment({
  displayerMode,
  activeTab: nucleus,
  zones,
  ranges,
}) {
  const alert = useAlert();
  const dispatch = useDispatch();
  const highlightData = useHighlightData();
  const assignments = useAssignmentData();

  const activeAssignment = useAssignment(
    assignments.data.activated
      ? assignments.data.activated.id
      : ConcatenationString, // dummy value
  );

  const [onAtomHoverHighlights, setOnAtomHoverHighlights] = useState<any>([]);
  const [onAtomHoverAction, setOnAtomHoverAction] = useState<
    'show' | 'hide' | null
  >(null);

  useEffect(() => {
    if (onAtomHoverAction) {
      if (onAtomHoverAction === 'show') {
        highlightData.dispatch({
          type: 'SHOW',
          payload: { convertedHighlights: onAtomHoverHighlights },
        });
      } else if (onAtomHoverAction === 'hide') {
        highlightData.dispatch({
          type: 'HIDE',
          payload: { convertedHighlights: onAtomHoverHighlights },
        });
        setOnAtomHoverHighlights([]);
      }
      setOnAtomHoverAction(null);
    }
  }, [onAtomHoverAction, onAtomHoverHighlights, highlightData]);

  const data = useMemo(() => {
    if (zones || ranges) {
      if (displayerMode === DISPLAYER_MODE.DM_1D && ranges && ranges.values) {
        return ranges.values;
      } else if (
        displayerMode === DISPLAYER_MODE.DM_2D &&
        zones &&
        zones.values
      ) {
        return zones.values;
      }
    }
    return [];
  }, [displayerMode, ranges, zones]);

  const assignedDiaIDs = useMemo(() => {
    const assignedDiaID: { x: Array<string>; y: Array<string> } = {
      x: [],
      y: [],
    };
    const assignment = assignments.data.assignments;
    for (let id in assignment) {
      if (assignment[id].x) {
        assignedDiaID.x.push(...assignment[id].x);
      }
      if (assignment[id].y) {
        assignedDiaID.y.push(...assignment[id].y);
      }
    }
    // with its structure it's prepared for showing assigned IDs per axis
    return assignedDiaID;
  }, [assignments.data]);

  // used for atom highlighting for now, until we would like to highlight atoms per axis separately
  const assignedDiaIDsMerged = useMemo(
    () => assignedDiaIDs.x.concat(assignedDiaIDs.y),
    [assignedDiaIDs.x, assignedDiaIDs.y],
  );

  const currentDiaIDsToHighlight = useMemo(() => {
    let highlights: string[] = [];
    highlightData.highlight.highlighted.forEach((highlightID) => {
      const temp = assignments.data.assignments[highlightID];
      if (temp) {
        const { datum } = findDatumAndSignalIndex(data, highlightID);
        const type = highlightData.highlight.sourceData?.type;
        if (
          datum &&
          (type === HighlightedSource.ZONE ||
            type === HighlightedSource.RANGE ||
            type === HighlightedSource.UNKNOWN)
        ) {
          // we are on range/zone level only, so add the belonging signal IDs to highlight too
          highlights = highlights.concat(
            datum.signals
              .map((signal) =>
                filterForIDsWithAssignment(assignments, [signal.id]).length > 0
                  ? signal.diaIDs
                  : [],
              )
              .flat(),
          );
        }
      }
    });
    return getCurrentDiaIDsToHighlight(assignments).concat(highlights);
  }, [
    assignments,
    data,
    highlightData.highlight.highlighted,
    highlightData.highlight.sourceData?.type,
  ]);

  const toggleAssignment = useCallback((diaID, atomInformation: AtomData) => {
    // a previous version of the code prevented to assign many time the same atom
    // see revision cc13abc18f77b6787b923e3c4edaef51750d9e90
    return toggleDiaIDs(diaID, atomInformation);
  }, []);

  const handleOnClickAtom = useCallback(
    (atom: Atom, event: MouseEvent) => {
      if (!checkModifierKeyActivated(event) && activeAssignment.activated) {
        const { axis, id } = activeAssignment.activated;
        if (id && axis) {
          const atomInformation = extractFromAtom(atom, nucleus, axis);
          if (atomInformation.nbAtoms > 0) {
            // save assignment in assignment hook
            const dimension =
              displayerMode === DISPLAYER_MODE.DM_1D ? '1D' : '2D';
            activeAssignment.toggle(atomInformation.oclIDs, dimension);
            // console.log(activeAssignment);
            // save assignment (diaIDs) in range/zone data
            const { datum, signalIndex } = findDatumAndSignalIndex(
              data,
              activeAssignment.id,
            );
            if (datum) {
              // determine the level of setting the diaIDs array (range vs. signal level) and save there
              // let nbAtoms = 0;
              // on range/zone level

              if (displayerMode === DISPLAYER_MODE.DM_1D) {
                const range = datum as Range;
                let _diaIDs: string[] = [];
                if (signalIndex === undefined) {
                  _diaIDs = range?.diaIDs || [];
                } else {
                  _diaIDs = range?.signals[signalIndex]?.diaIDs || [];
                }
                const [_diaID, nbAtoms] = toggleAssignment(
                  _diaIDs,
                  atomInformation,
                );
                dispatch({
                  type: SET_DIAID_RANGE,
                  payload: {
                    nbAtoms,
                    rangeData: datum,
                    diaIDs: _diaID,
                    signalIndex,
                  },
                });
              } else {
                const zone = datum as Zone;
                let _diaIDs: string[] = [];
                if (signalIndex === undefined) {
                  _diaIDs = zone[axis]?.diaIDs || [];
                } else {
                  _diaIDs = zone?.signals[signalIndex][axis]?.diaIDs || [];
                }
                const [_diaID, nbAtoms] = toggleAssignment(
                  _diaIDs,
                  atomInformation,
                );
                dispatch({
                  type: SET_DIAID_ZONE,
                  payload: {
                    nbAtoms,
                    zoneData: datum,
                    diaIDs: _diaID,
                    axis,
                    signalIndex,
                  },
                });
              }
            }
            activeAssignment.setActive(axis);
          } else {
            alert.info(
              'Not assigned! Different atom type or no attached hydrogens found!',
            );
          }
        }
      }
    },
    [
      activeAssignment,
      alert,
      data,
      dispatch,
      displayerMode,
      nucleus,
      toggleAssignment,
    ],
  );

  const handleOnAtomHover = useCallback(
    (atom: Atom) => {
      const { oclIDs } = extractFromAtom(atom, nucleus);

      // on enter the atom
      if (oclIDs.length > 0) {
        // set all IDs to highlight when hovering over an atom from assignment data
        const highlights = getHighlightsOnHover(assignments, oclIDs, data);
        setOnAtomHoverHighlights(highlights);
        setOnAtomHoverAction('show');
      } else {
        // on leave the atom
        setOnAtomHoverAction('hide');
      }
      // }
    },
    [assignments, data, nucleus],
  );

  return {
    handleOnAtomHover,
    handleOnClickAtom,
    currentDiaIDsToHighlight,
    assignedDiaIDsMerged,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ConcatenationString } from '../../../data/utilities/Concatenation';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import {
  filterForIDsWithAssignment,
  useAssignment,
  useAssignmentData,
} from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { HighlightedSource, useHighlightData } from '../../highlight';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import { SET_DIAID_RANGE, SET_DIAID_ZONE } from '../../reducer/types/Types';

import {
  extractFromAtom,
  findDatumAndSignalIndex,
  getCurrentDiaIDsToHighlight,
  getHighlightsOnHover,
  toggleDiaIDs,
} from './Utilities';

export default function useAtomAssignment({
  displayerMode,
  activeTab,
  zones,
  ranges,
}) {
  const alert = useAlert();
  const dispatch = useDispatch();
  const highlightData = useHighlightData();
  const assignmentData = useAssignmentData();

  const activeAssignment = useAssignment(
    assignmentData.assignment.activeID !== undefined
      ? assignmentData.assignment.activeID
      : ConcatenationString, // dummy value
  );

  const [onAtomHoverHighlights, setOnAtomHoverHighlights] = useState<any>([]);
  const [onAtomHoverAction, setOnAtomHoverAction] = useState<any>(null);
  const [elements, setElements] = useState<Array<any>>([]);

  useEffect(() => {
    if (activeTab) {
      const split = activeTab.split(',');
      if (split.length === 1) {
        setElements([activeTab.replace(/[0-9]/g, '')]);
      } else if (split.length === 2) {
        setElements(split.map((nucleus) => nucleus.replace(/[0-9]/g, '')));
      }
    }
  }, [activeTab]);

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
    const assignedDiaID: { x: Array<any>; y: Array<any> } = { x: [], y: [] };
    for (let id in assignmentData.assignment.assignment) {
      if (assignmentData.assignment.assignment[id].x) {
        assignedDiaID.x.push(...assignmentData.assignment.assignment[id].x);
      }
      if (assignmentData.assignment.assignment[id].y) {
        assignedDiaID.y.push(...assignmentData.assignment.assignment[id].y);
      }
    }
    // with its structure it's prepared for showing assigned IDs per axis
    return assignedDiaID;
  }, [assignmentData.assignment]);

  // used for atom highlighting for now, until we would like to highlight atoms per axis separately
  const assignedDiaIDsMerged = useMemo(
    () => assignedDiaIDs.x.concat(assignedDiaIDs.y),
    [assignedDiaIDs.x, assignedDiaIDs.y],
  );

  const currentDiaIDsToHighlight = useMemo(() => {
    let highlights = [];
    highlightData.highlight.highlighted.forEach((highlightID) => {
      const temp = assignmentData.assignment.assignment[highlightID];
      if (temp) {
        const { datum } = findDatumAndSignalIndex(data, highlightID);
        const type = highlightData.highlight.sourceData?.type;
        if (
          datum &&
          (type === HighlightedSource.ZONE || type === HighlightedSource.RANGE)
        ) {
          // we are on range/zone level only, so add the belonging signal IDs to highlight too
          highlights = highlights.concat(
            datum.signals
              .map((signal) =>
                filterForIDsWithAssignment(assignmentData, [signal.id]).length >
                0
                  ? signal.diaIDs
                  : [],
              )
              .flat(),
          );
        }
      }
    });
    return getCurrentDiaIDsToHighlight(assignmentData, displayerMode).concat(
      highlights,
    );
  }, [assignmentData, data, displayerMode, highlightData.highlight]);

  const toggleAssignment = useCallback(
    (diaID, atomInformation) => {
      // 1. one atom can only be assigned to one range/zone/signal
      // 2. check whether an atom is already assigned to a range to allow toggling the assignment
      if (
        assignedDiaIDsMerged.some((_oclID) =>
          atomInformation.oclIDs.includes(_oclID),
        ) &&
        !diaID.some((_oclID) => atomInformation.oclIDs.includes(_oclID))
      ) {
        alert.info('Atom is already assigned to another signal!');
        return diaID;
      }

      return toggleDiaIDs(diaID, atomInformation);
    },
    [alert, assignedDiaIDsMerged],
  );

  const handleOnClickAtom = useCallback(
    (atom, event) => {
      if (!checkModifierKeyActivated(event)) {
        if (activeAssignment.isActive) {
          const atomInformation = extractFromAtom(
            atom,
            elements,
            activeAssignment.activeAxis,
          );
          if (atomInformation.nbAtoms > 0) {
            // save assignment in assignment hook
            atomInformation.oclIDs.forEach((_oclID) => {
              activeAssignment.toggle(_oclID);
            });
            // save assignment (diaIDs) in range/zone data
            const { datum, signalIndex } = findDatumAndSignalIndex(
              data,
              activeAssignment.id,
            );
            if (datum) {
              // determine the level of setting the diaIDs array (range vs. signal level) and save there
              let _diaID = [];
              let nbAtoms = 0;
              // on range/zone level
              if (signalIndex === undefined) {
                if (displayerMode === DISPLAYER_MODE.DM_1D) {
                  [_diaID, nbAtoms] = toggleAssignment(
                    datum.diaIDs || [],
                    atomInformation,
                  );
                } else if (displayerMode === DISPLAYER_MODE.DM_2D) {
                  [_diaID, nbAtoms] = toggleAssignment(
                    datum[activeAssignment.activeAxis].diaIDs || [],
                    atomInformation,
                  );
                }
              } else if (datum.signals?.[signalIndex]) {
                // on signal level
                if (displayerMode === DISPLAYER_MODE.DM_1D) {
                  [_diaID, nbAtoms] = toggleAssignment(
                    datum.signals[signalIndex].diaIDs || [],
                    atomInformation,
                  );
                } else if (displayerMode === DISPLAYER_MODE.DM_2D) {
                  [_diaID, nbAtoms] = toggleAssignment(
                    datum.signals[signalIndex][activeAssignment.activeAxis]
                      .diaIDs || [],
                    atomInformation,
                  );
                }
              }
              if (displayerMode === DISPLAYER_MODE.DM_1D) {
                dispatch({
                  type: SET_DIAID_RANGE,
                  payload: {
                    nbAtoms,
                    rangeData: datum,
                    diaIDs: _diaID,
                    signalIndex,
                  },
                });
              } else if (displayerMode === DISPLAYER_MODE.DM_2D) {
                dispatch({
                  type: SET_DIAID_ZONE,
                  payload: {
                    nbAtoms,
                    zoneData: datum,
                    diaIDs: _diaID,
                    axis: activeAssignment.activeAxis,
                    signalIndex,
                  },
                });
              }
            }
            activeAssignment.onClick(activeAssignment.activeAxis);
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
      elements,
      toggleAssignment,
    ],
  );

  const handleOnAtomHover = useCallback(
    (atom) => {
      const oclIDs = extractFromAtom(
        atom,
        elements,
        activeAssignment.activeAxis,
      ).oclIDs;
      // on enter the atom
      if (oclIDs.length > 0) {
        // set all IDs to highlight when hovering over an atom from assignment data
        const highlights = getHighlightsOnHover(assignmentData, oclIDs, data);
        setOnAtomHoverHighlights(highlights);
        setOnAtomHoverAction('show');
      } else {
        // on leave the atom
        setOnAtomHoverAction('hide');
      }
    },
    [activeAssignment.activeAxis, assignmentData, data, elements],
  );

  return {
    handleOnAtomHover,
    handleOnClickAtom,
    currentDiaIDsToHighlight,
    assignedDiaIDsMerged,
  };
}

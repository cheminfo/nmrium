import { Range, Ranges, Zone, Zones } from 'nmr-processing';
import { DiaIDAndInfo } from 'openchemlib-utils';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { ConcatenationString } from '../../../data/utilities/Concatenation';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import {
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { HighlightEventSource, useHighlightData } from '../../highlight';
import { DisplayerMode } from '../../reducer/Reducer';

import {
  AtomData,
  extractFromAtom,
  findDatumAndSignalIndex,
  getCurrentDiaIDsToHighlight,
  getHighlightsOnHover,
  toggleDiaIDs,
} from './Utilities';

interface UseAtomAssignmentProps {
  displayerMode: DisplayerMode;
  activeTab: string;
  zones: Zones;
  ranges: Ranges;
}

export default function useAtomAssignment({
  displayerMode,
  activeTab: nucleus,
  zones,
  ranges,
}: UseAtomAssignmentProps) {
  const alert = useAlert();
  const dispatch = useDispatch();
  const highlightData = useHighlightData();
  const assignments = useAssignmentData();

  const activeAssignment = useAssignment(
    assignments.data.activated
      ? assignments.data.activated.id
      : ConcatenationString, // dummy value
  );
  const [onAtomHoverHighlights, setOnAtomHoverHighlights] = useState<string[]>(
    [],
  );
  const [onAtomHoverAction, setOnAtomHoverAction] = useState<
    'show' | 'hide' | null
  >(null);

  useEffect(() => {
    if (onAtomHoverAction) {
      if (onAtomHoverAction === 'show') {
        highlightData.dispatch({
          type: 'SHOW',
          payload: {
            convertedHighlights: onAtomHoverHighlights,
            sourceData: { type: HighlightEventSource.ATOM },
          },
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
      if (displayerMode === '1D' && ranges?.values) {
        return ranges.values;
      } else if (displayerMode === '2D' && zones?.values) {
        return zones.values;
      }
    }
    return [];
  }, [displayerMode, ranges, zones]);

  const assignedDiaIDs = useMemo(() => {
    const assignedDiaID: { x: string[]; y: string[] } = {
      x: [],
      y: [],
    };
    const assignment = assignments.data.assignments;
    for (const id in assignment) {
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
    const highlights = highlightData.highlight.highlighted
      .filter((highlightID) => {
        return assignments.data.assignments[highlightID];
      })
      .flatMap((highlightID) => {
        const { datum } = findDatumAndSignalIndex(data, highlightID);
        const type = highlightData.highlight.sourceData?.type;
        if (
          datum &&
          (type === HighlightEventSource.ZONE ||
            type === HighlightEventSource.RANGE ||
            type === HighlightEventSource.ATOM)
        ) {
          // we are on range/zone level only, so add the belonging signal IDs to highlight too
          return datum.signals.flatMap((signal) =>
            filterForIDsWithAssignment(assignments, [signal.id]).length > 0
              ? signal.diaIDs
              : [],
          );
        }
        return [];
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
    (diaIDAndInfo: DiaIDAndInfo | undefined, event: MouseEvent) => {
      if (!checkModifierKeyActivated(event) && activeAssignment.activated) {
        const { axis, id } = activeAssignment.activated;
        if (id && axis) {
          const atomInformation = extractFromAtom(diaIDAndInfo, nucleus, axis);
          if (atomInformation.nbAtoms > 0) {
            // save assignment in assignment hook
            const dimension = displayerMode === '1D' ? '1D' : '2D';
            activeAssignment.toggle(atomInformation.oclIDs, dimension);
            // save assignment (diaIDs) in range/zone data
            const { datum, signalIndex } = findDatumAndSignalIndex(
              data,
              activeAssignment.id,
            );
            if (datum) {
              // determine the level of setting the diaIDs array (range vs. signal level) and save there
              // let nbAtoms = 0;
              // on range/zone level

              if (displayerMode === '1D') {
                const range = datum as Range;
                let _diaIDs: string[] = [];
                if (signalIndex === undefined) {
                  _diaIDs = range?.diaIDs || [];
                } else {
                  _diaIDs = range?.signals[signalIndex]?.diaIDs || [];
                }
                const { diaIDs, nbAtoms } = toggleAssignment(
                  _diaIDs,
                  atomInformation,
                );
                dispatch({
                  type: 'SET_DIAID_RANGE',
                  payload: {
                    nbAtoms,
                    range,
                    diaIDs,
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
                const { diaIDs, nbAtoms } = toggleAssignment(
                  _diaIDs,
                  atomInformation,
                );
                dispatch({
                  type: 'SET_ZONE_DIAID',
                  payload: {
                    nbAtoms,
                    zone,
                    diaIDs,
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
    (diaIDAndInfo: DiaIDAndInfo | undefined) => {
      const { oclIDs } = extractFromAtom(diaIDAndInfo, nucleus);

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

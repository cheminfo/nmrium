import type { Range, Ranges, Zone, Zones } from 'nmr-processing';
import type { DiaIDAndInfo } from 'openchemlib-utils';
import type { MouseEvent } from 'react';
import { useCallback, useMemo, useRef } from 'react';

import { ConcatenationString } from '../../../data/utilities/Concatenation.js';
import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated.js';
import { useAssignmentContext } from '../../assignment/AssignmentsContext.js';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import {
  HighlightEventSource,
  useHighlightData,
} from '../../highlight/index.js';
import type { DisplayerMode } from '../../reducer/Reducer.js';

import type { AtomData } from './Utilities.js';
import {
  extractFromAtom,
  findDatumAndSignalIndex,
  getCurrentDiaIDsToHighlight,
  getHighlightsOnHover,
  toggleDiaIDs,
} from './Utilities.js';

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
  const toaster = useToaster();
  const dispatch = useDispatch();
  const highlightData = useHighlightData();
  const highlightedIdDsRef = useRef<string[]>([]);
  const assignments = useAssignmentContext();
  const activatedKey = assignments.activated
    ? assignments.activated.id
    : ConcatenationString; // dummy value

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
    const assignment = assignments.data;
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
        return assignments.data[highlightID];
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
      if (!checkModifierKeyActivated(event) && assignments.activated) {
        const { axis, id } = assignments.activated;
        if (id && axis) {
          const atomInformation = extractFromAtom(diaIDAndInfo, nucleus, axis);
          if (atomInformation.nbAtoms > 0) {
            // save assignment in assignment hook
            // save assignment (diaIDs) in range/zone data
            const { datum, signalIndex } = findDatumAndSignalIndex(
              data,
              assignments.activated.id,
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
            assignments.activate({ id: activatedKey, axis });
          } else {
            toaster.show({
              message:
                'Not assigned! Different atom type or no attached hydrogens found!',
            });
          }
        }
      }
    },
    [
      activatedKey,
      assignments,
      data,
      dispatch,
      displayerMode,
      nucleus,
      toaster,
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
        highlightedIdDsRef.current = highlights;
        highlightData.dispatch({
          type: 'SHOW',
          payload: {
            convertedHighlights: highlights,
            sourceData: { type: HighlightEventSource.ATOM },
          },
        });
      } else {
        highlightData.dispatch({
          type: 'HIDE',
          payload: { convertedHighlights: highlightedIdDsRef.current },
        });
        highlightedIdDsRef.current = [];
      }
      // }
    },
    [assignments, data, highlightData, nucleus],
  );

  return {
    handleOnAtomHover,
    handleOnClickAtom,
    currentDiaIDsToHighlight,
    assignedDiaIDsMerged,
  };
}

import { useCallback, useMemo } from 'react';

import { useAssignmentData } from '../../../assignment/AssignmentsContext.js';
import { useDispatch } from '../../../context/DispatchContext.js';

import { RangeData } from './useMapRanges.js';

function getZoomRange(range: RangeData): [number, number] {
  const { from, to } = range;
  const margin = Math.abs(from - to);
  return [from - margin, to + margin];
}

export default function useEditRangeModal() {
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();

  const zoomRange = useCallback(
    (range: RangeData) => {
      if (!range) {
        return;
      }

      const xDomain = getZoomRange(range);
      dispatch({
        type: 'SET_X_DOMAIN',
        payload: {
          xDomain,
        },
      });
    },
    [dispatch],
  );

  const deleteRange = useCallback(
    (id: string, resetSelectTool = false) => {
      dispatch({
        type: 'DELETE_RANGE',
        payload: {
          id,
          assignmentData,
          resetSelectTool,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const changeRangeSignalKind = useCallback(
    (kind, range: RangeData) => {
      if (!range) {
        dispatch({
          type: 'CHANGE_RANGE_SIGNAL_KIND',
          payload: {
            range,
            kind,
          },
        });
      }
    },
    [dispatch],
  );

  const saveEditRange = useCallback(
    (editedRange) => {
      dispatch({
        type: 'SAVE_EDITED_RANGE',
        payload: {
          range: editedRange,
          assignmentData,
        },
      });
      // if (automaticCloseModal) {
      //   modal.close();
      // }
    },
    [assignmentData, dispatch],
  );

  const reset = useCallback(
    (originalRange) => {
      saveEditRange(originalRange);
      // modal.close();
    },
    [saveEditRange],
  );

  return useMemo(
    () => ({
      deleteRange,
      zoomRange,
      changeRangeSignalKind,
      saveEditRange,
      reset,
    }),
    [changeRangeSignalKind, deleteRange, reset, saveEditRange, zoomRange],
  );
}

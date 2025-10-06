import { useCallback, useMemo } from 'react';

import { useDispatch } from '../../../context/DispatchContext.js';

import type { RangeData } from './useMapRanges.js';

function getZoomRange(range: RangeData): [number, number] {
  const { from, to } = range;
  const margin = Math.abs(from - to);
  return [from - margin, to + margin];
}

export default function useEditRangeModal() {
  const dispatch = useDispatch();

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
          resetSelectTool,
        },
      });
    },
    [dispatch],
  );

  const changeRangeSignalKind = useCallback(
    (kind: any, range: RangeData) => {
      if (!range) return;
      dispatch({
        type: 'CHANGE_RANGE_SIGNAL_KIND',
        payload: {
          range,
          kind,
        },
      });
    },
    [dispatch],
  );

  const saveEditRange = useCallback(
    (editedRange: any) => {
      dispatch({
        type: 'SAVE_EDITED_RANGE',
        payload: {
          range: editedRange,
        },
      });
      // if (automaticCloseModal) {
      //   modal.close();
      // }
    },
    [dispatch],
  );

  const reset = useCallback(
    (originalRange: any) => {
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

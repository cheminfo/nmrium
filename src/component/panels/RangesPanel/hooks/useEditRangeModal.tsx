import { useCallback, useMemo } from 'react';

import { useAssignmentData } from '../../../assignment/AssignmentsContext';
import { useDispatch } from '../../../context/DispatchContext';
import { useModal } from '../../../elements/popup/Modal';
import { positions, transitions } from '../../../elements/popup/options';
import EditRangeModal from '../../../modal/editRange/EditRangeModal';
import {
  CHANGE_RANGE_SIGNAL_KIND,
  DELETE_RANGE,
  SAVE_EDITED_RANGE,
  SET_SELECTED_TOOL,
  SET_X_DOMAIN,
} from '../../../reducer/types/Types';
import { options } from '../../../toolbar/ToolTypes';

import { RangeData } from './useMapRanges';

export default function useEditRangeModal(range?: RangeData) {
  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();

  const zoomRange = useCallback(
    (modalRange?: RangeData) => {
      const _range = modalRange || range;
      if (_range) {
        const { from, to } = _range;
        const margin = Math.abs(from - to);
        dispatch({
          type: SET_X_DOMAIN,
          xDomain: [from - margin, to + margin],
        });
      }
    },
    [dispatch, range],
  );

  const deleteRange = useCallback(
    (id?: string, resetSelectTool = false) => {
      if (range || id) {
        dispatch({
          type: DELETE_RANGE,
          payload: {
            data: { id: id || range?.id, assignmentData },
            resetSelectTool,
          },
        });
      }
    },
    [assignmentData, dispatch, range],
  );

  const changeRangeSignalKind = useCallback(
    (value) => {
      if (range) {
        dispatch({
          type: CHANGE_RANGE_SIGNAL_KIND,
          payload: {
            data: { rowData: range, value },
          },
        });
      }
    },
    [dispatch, range],
  );

  const saveEditRangeHandler = useCallback(
    (editedRowData, automaticCloseModal = true) => {
      dispatch({
        type: SAVE_EDITED_RANGE,
        payload: {
          editedRowData,
          assignmentData,
        },
      });
      if (automaticCloseModal) {
        modal.close();
      }
    },
    [assignmentData, dispatch, modal],
  );

  const closeEditRangeHandler = useCallback(
    (range: Partial<{ id: string }>, originalRange) => {
      if (range.id === 'new') {
        deleteRange(range.id, true);
      } else {
        saveEditRangeHandler(originalRange, false);
      }
      modal.close();
    },
    [deleteRange, modal, saveEditRangeHandler],
  );

  const editRange = useCallback(
    (isManual = false) => {
      dispatch({
        type: SET_SELECTED_TOOL,
        payload: { selectedTool: options.editRange.id },
      });

      modal.show(
        <EditRangeModal
          onCloseEditRangeModal={closeEditRangeHandler}
          onSaveEditRangeModal={saveEditRangeHandler}
          onZoomEditRangeModal={zoomRange}
          range={isManual ? {} : range}
          manualRange={isManual}
        />,
        {
          position: positions.MIDDLE_RIGHT,
          transition: transitions.SCALE,
          isBackgroundBlur: false,
        },
      );

      zoomRange();
    },
    [
      closeEditRangeHandler,
      dispatch,
      modal,
      range,
      saveEditRangeHandler,
      zoomRange,
    ],
  );

  return useMemo(
    () => ({
      editRange,
      deleteRange,
      zoomRange,
      changeRangeSignalKind,
    }),
    [changeRangeSignalKind, deleteRange, editRange, zoomRange],
  );
}

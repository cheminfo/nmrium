import { useCallback, useMemo } from 'react';

import { useAssignmentData } from '../../../assignment';
import { useDispatch } from '../../../context/DispatchContext';
import { useModal } from '../../../elements/popup/Modal';
import { positions } from '../../../elements/popup/options';
import EditRangeModal from '../../../modal/editRange/EditRangeModal';
import {
  CHANGE_RANGE_SIGNAL_KIND,
  DELETE_RANGE,
  RESET_SELECTED_TOOL,
  SAVE_EDITED_RANGE,
  SET_SELECTED_TOOL,
  SET_X_DOMAIN,
} from '../../../reducer/types/Types';
import { options } from '../../../toolbar/ToolTypes';

import { RangeData } from './useMapRanges';

export default function useEditRangeModal(range: RangeData) {
  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();
  const zoomRange = useCallback(() => {
    const margin = Math.abs(range.from - range.to);
    dispatch({
      type: SET_X_DOMAIN,
      xDomain: [range.from - margin, range.to + margin],
    });
  }, [dispatch, range.from, range.to]);

  const deleteRange = useCallback(() => {
    dispatch({
      type: DELETE_RANGE,
      payload: {
        data: { id: range.id, assignmentData },
      },
    });
  }, [assignmentData, dispatch, range.id]);

  const changeRangeSignalKind = useCallback(
    (value) => {
      dispatch({
        type: CHANGE_RANGE_SIGNAL_KIND,
        payload: {
          data: { rowData: range, value },
        },
      });
    },
    [dispatch, range],
  );

  const saveEditRangeHandler = useCallback(
    (editedRowData) => {
      dispatch({
        type: SAVE_EDITED_RANGE,
        payload: {
          editedRowData,
          assignmentData,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const closeEditRangeHandler = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.close();
  }, [dispatch, modal]);

  const editRange = useCallback(() => {
    dispatch({
      type: SET_SELECTED_TOOL,
      payload: { selectedTool: options.editRange.id, tempRange: range },
    });
    modal.show(
      <EditRangeModal
        onCloseEditRangeModal={closeEditRangeHandler}
        onSaveEditRangeModal={saveEditRangeHandler}
        onZoomEditRangeModal={zoomRange}
        // range={range}
      />,
      {
        position: positions.MIDDLE_RIGHT,
        // transition: transitions.SCALE,
        isBackgroundBlur: false,
      },
    );
  }, [
    closeEditRangeHandler,
    dispatch,
    modal,
    range,
    saveEditRangeHandler,
    zoomRange,
  ]);

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

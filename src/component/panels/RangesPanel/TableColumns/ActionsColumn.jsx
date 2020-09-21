import lodash from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { positions, transitions } from 'react-alert';
import { FaRegTrashAlt, FaSearchPlus, FaEdit } from 'react-icons/fa';

import { useAssignmentData } from '../../../assignment';
import { useDispatch } from '../../../context/DispatchContext';
import { useModal } from '../../../elements/Modal';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';
import EditRangeModal from '../../../modal/editRange/EditRangeModal';
import {
  SET_X_DOMAIN,
  CHANGE_RANGE_DATA,
  RESET_SELECTED_TOOL,
  SET_SELECTED_TOOL,
} from '../../../reducer/types/Types';
import { SignalKinds } from '../../extra/constants/SignalsKinds';
import {
  unlink,
  unlinkInAssignmentData,
  deleteRange,
} from '../../extra/utilities/RangeUtilities';

const selectBoxStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const ActionsColumn = ({ rowData, onHoverSignal, rowSpanTags }) => {
  const dispatch = useDispatch();
  const modal = useModal();
  const assignmentData = useAssignmentData();

  const zoomRangeHandler = useCallback(() => {
    const margin = Math.abs(rowData.from - rowData.to) / 2;
    dispatch({
      type: SET_X_DOMAIN,
      xDomain: [rowData.from - margin, rowData.to + margin],
    });
  }, [dispatch, rowData.from, rowData.to]);

  const deleteRangeHandler = useCallback(() => {
    deleteRange(assignmentData, dispatch, rowData);
  }, [assignmentData, dispatch, rowData]);

  const changeRangeSignalKindHandler = useCallback(
    (value) => {
      const _rowData = lodash.cloneDeep(rowData);
      _rowData.signal[_rowData.tableMetaInfo.signalIndex].kind = value;
      dispatch({
        type: CHANGE_RANGE_DATA,
        data: _rowData,
      });
    },
    [dispatch, rowData],
  );

  const saveEditRangeHandler = useCallback(
    (editedRange) => {
      let _range = lodash.cloneDeep(editedRange);
      // for now: clear all assignments for this range because signals or levels to store might have changed
      unlinkInAssignmentData(assignmentData, _range);
      _range = unlink(_range);
      delete _range.tableMetaInfo;

      dispatch({
        type: CHANGE_RANGE_DATA,
        data: _range,
      });
    },
    [assignmentData, dispatch],
  );

  const closeEditRangeHandler = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.close();
  }, [dispatch, modal]);

  const openEditRangeHandler = useCallback(() => {
    dispatch({ type: SET_SELECTED_TOOL, selectedTool: 'editRange' });
    modal.show(
      <EditRangeModal
        onCloseEditRangeModal={closeEditRangeHandler}
        onSaveEditRangeModal={saveEditRangeHandler}
        onZoomEditRangeModal={zoomRangeHandler}
        rangeData={rowData}
      />,
      {
        position: positions.CENTER_RIGHT,
        transition: transitions.SCALE,
        isBackgroundBlur: false,
      },
    );
  }, [
    closeEditRangeHandler,
    dispatch,
    modal,
    rowData,
    saveEditRangeHandler,
    zoomRangeHandler,
  ]);

  return (
    <Fragment>
      <td {...onHoverSignal}>
        <SelectUncontrolled
          onChange={changeRangeSignalKindHandler}
          data={SignalKinds}
          value={rowData.tableMetaInfo.signal.kind}
          style={selectBoxStyle}
        />
      </td>
      <td {...rowSpanTags}>
        <button
          type="button"
          className="delete-button"
          onClick={deleteRangeHandler}
        >
          <FaRegTrashAlt />
        </button>
        <button
          type="button"
          className="zoom-button"
          onClick={zoomRangeHandler}
        >
          <FaSearchPlus title="Zoom to range in spectrum" />
        </button>
        <button
          type="button"
          className="edit-button"
          onClick={openEditRangeHandler}
        >
          <FaEdit color="blue" />
        </button>
      </td>
    </Fragment>
  );
};

export default ActionsColumn;

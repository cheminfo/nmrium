import lodash from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { positions, transitions, useAlert } from 'react-alert';
import { FaRegTrashAlt, FaSearchPlus, FaEdit } from 'react-icons/fa';

import { useDispatch } from '../../../context/DispatchContext';
import { useModal } from '../../../elements/Modal';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';
import EditRangeModal from '../../../modal/editRange/EditRangeModal';
import {
  SET_X_DOMAIN,
  DELETE_RANGE,
  CHANGE_RANGE_DATA,
  RESET_SELECTED_TOOL,
} from '../../../reducer/types/Types';
import { SignalKinds } from '../../extra/constants/SignalsKinds';
import { addDefaultSignal } from '../../extra/utilities/RangeUtilities';

const selectBoxStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const ActionsColumn = ({ rowData, onHoverSignal, onUnlink, rowSpanTags }) => {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();

  const zoomRangeHandler = useCallback(() => {
    const margin = Math.abs(rowData.from - rowData.to) / 2;
    dispatch({
      type: SET_X_DOMAIN,
      xDomain: [rowData.from - margin, rowData.to + margin],
    });
  }, [dispatch, rowData.from, rowData.to]);

  const deleteRangeHandler = useCallback(
    (e) => {
      onUnlink(e);
      dispatch({
        type: DELETE_RANGE,
        rangeID: rowData.id,
      });
    },
    [dispatch, onUnlink, rowData],
  );

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
      // for now: clear all assignments for this range because signals or levels to store might have changed
      onUnlink();
      // if all signals were deleted then insert a default signal with "m" as multiplicity
      if (editedRange.signal.length === 0) {
        addDefaultSignal(editedRange);
        alert.info(
          `There must be at least one signal within a range. Default signal with "m" was therefore added!`,
        );
      }
      dispatch({
        type: CHANGE_RANGE_DATA,
        data: editedRange,
      });
    },
    [alert, dispatch, onUnlink],
  );

  const closeEditRangeHandler = useCallback(() => {
    modal.close();
  }, [modal]);

  const openEditRangeHandler = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(
      <EditRangeModal
        onClose={closeEditRangeHandler}
        onSave={saveEditRangeHandler}
        onZoom={zoomRangeHandler}
        range={rowData}
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

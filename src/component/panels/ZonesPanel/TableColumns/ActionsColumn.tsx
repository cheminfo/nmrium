import { CSSProperties, Fragment, useCallback } from 'react';
import { FaEdit, FaRegTrashAlt, FaSearchPlus } from 'react-icons/fa';

import { useAssignmentData } from '../../../assignment/AssignmentsContext';
import { useDispatch } from '../../../context/DispatchContext';
import Select from '../../../elements/Select';
import {
  useModal,
  positions,
  transitions,
} from '../../../elements/popup/Modal';
import EditZoneModal from '../../../modal/editZone/EditZoneModal';
import { ZoneData } from '../hooks/useMapZones';
import { useSignalKinds } from '../../../hooks/useSignalKinds';

const selectBoxStyle: CSSProperties = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

interface ActionsColumnProps {
  rowData: ZoneData;
  rowSpanTags: any;
}

function ActionsColumn({ rowData, rowSpanTags }: ActionsColumnProps) {
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();
  const signalKinds = useSignalKinds();
  const modal = useModal();

  const changeSignalKindHandler = useCallback(
    (kind) => {
      dispatch({
        type: 'CHANGE_ZONE_SIGNAL_KIND',
        payload: {
          zoneData: rowData,
          kind,
        },
      });
    },
    [dispatch, rowData],
  );

  const deleteZoneHandler = useCallback(() => {
    dispatch({
      type: 'DELETE_2D_ZONE',
      payload: {
        id: rowData.id,
        assignmentData,
      },
    });
  }, [assignmentData, dispatch, rowData]);

  const zoomZoneHandler = useCallback(() => {
    const xMargin = Math.abs(rowData.x.from - rowData.x.to) * 10;
    dispatch({
      type: 'SET_X_DOMAIN',
      payload: {
        xDomain:
          rowData.x.from <= rowData.x.to
            ? [rowData.x.from - xMargin, rowData.x.to + xMargin]
            : [rowData.x.to - xMargin, rowData.x.from + xMargin],
      },
    });
    const yMargin = Math.abs(rowData.y.from - rowData.y.to) * 10;
    dispatch({
      type: 'SET_Y_DOMAIN',
      payload: {
        yDomain:
          rowData.y.from <= rowData.y.to
            ? [rowData.y.from - yMargin, rowData.y.to + yMargin]
            : [rowData.y.to - yMargin, rowData.y.from + yMargin],
      },
    });
  }, [dispatch, rowData.x.from, rowData.x.to, rowData.y.from, rowData.y.to]);

  const saveEditZoneHandler = useCallback(
    (zone) => {
      dispatch({
        type: 'SAVE_EDITED_ZONE',
        payload: {
          zone,
        },
      });
    },
    [dispatch],
  );

  const openEditZoneHandler = useCallback(() => {
    dispatch({
      type: 'SET_SELECTED_TOOL',
      payload: { selectedTool: 'editRange' },
    });
    modal.show(
      <EditZoneModal
        onCloseEditZoneModal={() => modal.close()}
        onSaveEditZoneModal={saveEditZoneHandler}
        onZoomEditZoneModal={() => zoomZoneHandler()}
        rowData={rowData}
      />,
      {
        position: positions.MIDDLE_RIGHT,
        transition: transitions.SCALE,
        isBackgroundBlur: false,
      },
    );
  }, [dispatch, modal, rowData, saveEditZoneHandler, zoomZoneHandler]);

  return (
    <Fragment>
      <td>
        <Select
          onChange={(value) => {
            changeSignalKindHandler(value);
          }}
          items={signalKinds}
          defaultValue={rowData.tableMetaInfo.signal.kind}
          style={selectBoxStyle}
        />
      </td>
      <td {...rowSpanTags}>
        <button
          type="button"
          className="delete-button"
          onClick={deleteZoneHandler}
        >
          <FaRegTrashAlt />
        </button>
        <button type="button" className="zoom-button" onClick={zoomZoneHandler}>
          <FaSearchPlus title="Zoom to zone in spectrum" />
        </button>
        <button
          type="button"
          className="edit-button"
          onClick={openEditZoneHandler}
        >
          <FaEdit color="blue" />
        </button>
      </td>
    </Fragment>
  );
}

export default ActionsColumn;

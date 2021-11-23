import { CSSProperties, Fragment, useCallback } from 'react';
import { FaEdit, FaRegTrashAlt, FaSearchPlus } from 'react-icons/fa';

import { SignalKinds } from '../../../../data/constants/SignalsKinds';
import { useAssignmentData } from '../../../assignment';
import { useDispatch } from '../../../context/DispatchContext';
import Select from '../../../elements/Select';
import {
  useModal,
  positions,
  transitions,
} from '../../../elements/popup/Modal';
import EditZoneModal from '../../../modal/editZone/EditZoneModal';
import {
  CHANGE_ZONE_SIGNAL_KIND,
  DELETE_2D_ZONE,
  SAVE_EDITED_ZONE,
  SET_SELECTED_TOOL,
  SET_X_DOMAIN,
  SET_Y_DOMAIN,
} from '../../../reducer/types/Types';
import { options } from '../../../toolbar/ToolTypes';

const selectBoxStyle: CSSProperties = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

export interface RowDataProps {
  id: number;
  tableMetaInfo: {
    id: number;
    signalIndex: number;
    rowSpan: any;
    signal: {
      kind: any;
    };
    experiment: string;
  };
  x: {
    from: number;
    to: number;
  };
  y: {
    from: number;
    to: number;
  };
}

interface ActionsColumnProps {
  rowData: RowDataProps;
  rowSpanTags: any;
}

function ActionsColumn({ rowData, rowSpanTags }: ActionsColumnProps) {
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();
  const modal = useModal();

  const changeSignalKindHandler = useCallback(
    (value) => {
      dispatch({
        type: CHANGE_ZONE_SIGNAL_KIND,
        payload: {
          rowData,
          value,
        },
      });
    },
    [dispatch, rowData],
  );

  const deleteZoneHandler = useCallback(() => {
    dispatch({
      type: DELETE_2D_ZONE,
      payload: {
        id: rowData.id,
        assignmentData,
      },
    });
  }, [assignmentData, dispatch, rowData]);

  const zoomZoneHandler = useCallback(() => {
    const xMargin = Math.abs(rowData.x.from - rowData.x.to) * 10;
    dispatch({
      type: SET_X_DOMAIN,
      xDomain:
        rowData.x.from <= rowData.x.to
          ? [rowData.x.from - xMargin, rowData.x.to + xMargin]
          : [rowData.x.to - xMargin, rowData.x.from + xMargin],
    });
    const yMargin = Math.abs(rowData.y.from - rowData.y.to) * 10;
    dispatch({
      type: SET_Y_DOMAIN,
      yDomain:
        rowData.y.from <= rowData.y.to
          ? [rowData.y.from - yMargin, rowData.y.to + yMargin]
          : [rowData.y.to - yMargin, rowData.y.from + yMargin],
    });
  }, [dispatch, rowData.x.from, rowData.x.to, rowData.y.from, rowData.y.to]);

  const saveEditZoneHandler = useCallback(
    (editedRowData) => {
      dispatch({
        type: SAVE_EDITED_ZONE,
        payload: {
          editedRowData,
        },
      });
    },
    [dispatch],
  );

  const openEditZoneHandler = useCallback(() => {
    dispatch({
      type: SET_SELECTED_TOOL,
      payload: { selectedTool: options.editRange.id, tempRange: rowData },
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
          data={SignalKinds}
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

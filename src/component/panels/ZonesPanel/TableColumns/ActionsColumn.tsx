import { FaEdit, FaRegTrashAlt, FaSearchPlus } from 'react-icons/fa';

import { SIGNAL_KINDS } from '../../../../data/constants/signalsKinds.js';
import { useAssignmentData } from '../../../assignment/AssignmentsContext.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { Select2 } from '../../../elements/Select2.js';
import { EditZoneModal } from '../../../modal/editZone/EditZoneModal.js';
import type { ZoneData } from '../hooks/useMapZones.js';
import { useZoneActions } from '../hooks/useZoneActions.js';

interface ActionsColumnProps {
  rowData: ZoneData;
  rowSpanTags: any;
  showKind: boolean;
  showDeleteAction: boolean;
  showEditAction: boolean;
  showZoomAction: boolean;
}

function ActionsColumn({
  rowData,
  rowSpanTags,
  showKind,
  showDeleteAction,
  showEditAction,
  showZoomAction,
}: ActionsColumnProps) {
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();
  const showActions = showDeleteAction || showEditAction || showZoomAction;

  function changeSignalKindHandler(kind) {
    dispatch({
      type: 'CHANGE_ZONE_SIGNAL_KIND',
      payload: {
        zoneData: rowData,
        kind,
      },
    });
  }

  function deleteZoneHandler() {
    dispatch({
      type: 'DELETE_2D_ZONE',
      payload: {
        id: rowData.id,
        assignmentData,
      },
    });
  }

  const { zoomToZone } = useZoneActions();
  const { openDialog } = useDialog();

  function handleEditZone() {
    openDialog(EditZoneModal, rowData);
    zoomToZone(rowData);
  }

  return (
    <>
      {showKind && (
        <td>
          <Select2
            onItemSelect={({ value }) => changeSignalKindHandler(value)}
            items={SIGNAL_KINDS}
            selectedItemValue={rowData.tableMetaInfo.signal.kind}
            selectedButtonProps={{ minimal: true, small: true }}
            fill
          />
        </td>
      )}
      {showActions && (
        <td {...rowSpanTags}>
          {showDeleteAction && (
            <button
              type="button"
              className="delete-button"
              onClick={deleteZoneHandler}
            >
              <FaRegTrashAlt />
            </button>
          )}
          {showZoomAction && (
            <button
              type="button"
              className="zoom-button"
              onClick={() => zoomToZone(rowData)}
            >
              <FaSearchPlus title="Zoom to zone in spectrum" />
            </button>
          )}
          {showEditAction && (
            <button
              type="button"
              className="edit-button"
              onClick={handleEditZone}
            >
              <FaEdit color="blue" />
            </button>
          )}
        </td>
      )}
    </>
  );
}

export default ActionsColumn;

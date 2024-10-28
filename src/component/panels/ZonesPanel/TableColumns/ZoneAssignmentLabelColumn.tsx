import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import type { ZoneData } from '../hooks/useMapZones.js';

interface ZoneAssignmentLabelColumnProps {
  rowData: ZoneData;
}

export function ZoneAssignmentLabelColumn({
  rowData,
}: ZoneAssignmentLabelColumnProps) {
  const dispatch = useDispatch();

  function saveHandler(event) {
    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value: event.target.value,
        zoneID: rowData.id,
      },
    });
  }

  return (
    <td>
      <EditableColumn
        value={rowData?.assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
      />
    </td>
  );
}

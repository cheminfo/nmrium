import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import type { ZoneData } from '../hooks/useMapZones.js';

interface ZoneAssignmentLabelColumnProps {
  rowData: ZoneData;
}

export function ZoneAssignmentLabelColumn(
  props: ZoneAssignmentLabelColumnProps,
) {
  const { rowData } = props;
  const dispatch = useDispatch();

  const { id: signalID, assignment } = rowData.signals[0] || {};

  function saveHandler(value: string | number) {
    dispatch({
      type: 'CHANGE_ZONE_ASSIGNMENT_LABEL',
      payload: {
        value: String(value),
        zoneID: rowData.id,
        signalID,
      },
    });
  }

  return (
    <td>
      <EditableColumn
        value={assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
      />
    </td>
  );
}

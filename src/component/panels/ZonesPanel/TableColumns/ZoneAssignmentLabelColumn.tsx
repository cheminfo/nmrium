import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { ZoneData } from '../hooks/useMapZones';

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
      />
    </td>
  );
}

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { OnHoverEvent, RowSpanTags } from '../RangesTableRow';
import { RangeData } from '../hooks/useMapRanges';

type RangeAssignmentColumnProps = OnHoverEvent &
  RowSpanTags & { row: RangeData };

export function RangeAssignmentColumn({
  row,
  onHover,
  rowSpanTags,
}: RangeAssignmentColumnProps) {
  const dispatch = useDispatch();

  function saveHandler(event) {
    dispatch({
      type: 'CHANGE_RANGE_ASSIGNMENT_LABEL',
      payload: {
        value: event.target.value,
        rangeID: row.id,
      },
    });
  }

  return (
    <td {...rowSpanTags} {...onHover}>
      <EditableColumn
        value={row?.assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
      />
    </td>
  );
}

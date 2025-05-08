import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import type { OnHoverEvent, RowSpanTags } from '../RangesTableRow.js';
import type { RangeData } from '../hooks/useMapRanges.js';

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
        rangeId: row.id,
      },
    });
  }

  return (
    <td {...rowSpanTags} {...onHover}>
      <EditableColumn
        value={row?.assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
      />
    </td>
  );
}

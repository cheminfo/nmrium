import { useDispatch } from '../../../context/DispatchContext.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

interface SignalAssignmentColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>, OnHoverEvent {
  highlight: {
    isActive: boolean;
  };
}

export function SignalAssignmentColumn({
  row,
  onHover,
}: SignalAssignmentColumnProps) {
  const dispatch = useDispatch();
  const signal = row?.tableMetaInfo?.signal;

  function saveHandler(event: any) {
    dispatch({
      type: 'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
      payload: {
        value: event.target.value,
        rangeId: row.id,
        signalId: signal.id,
      },
    });
  }

  return (
    <td {...onHover}>
      <EditableColumn
        value={signal?.assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
      />
    </td>
  );
}

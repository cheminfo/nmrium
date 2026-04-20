import { useDispatch } from '../../../context/DispatchContext.js';
import type { EditableColumnProps } from '../../../elements/EditableColumn.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

interface SignalAssignmentColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>, OnHoverEvent {
  highlight: {
    isActive: boolean;
  };
}

export function SignalAssignmentColumn(props: SignalAssignmentColumnProps) {
  const { row, onHover } = props;
  const dispatch = useDispatch();
  const signal = row.tableMetaInfo.signal;

  const saveHandler: EditableColumnProps['onSave'] = (value) => {
    dispatch({
      type: 'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
      payload: {
        value: String(value),
        rangeId: row.id,
        signalId: signal?.id,
      },
    });
  };

  return (
    <td {...onHover}>
      <EditableColumn
        value={signal?.assignment || ''}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
        clickType={signal ? 'single' : 'none'}
      />
    </td>
  );
}

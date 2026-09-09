import { Button } from 'react-science/ui';

import { useDispatch } from '../../../context/DispatchContext.js';
import type { EditableColumnProps } from '../../../elements/EditableColumn.js';
import {
  CloseEditOnClick,
  EditableColumn,
} from '../../../elements/EditableColumn.js';
import { useExtractAtomAssignmentLabel } from '../../MoleculesPanel/hooks/useExtractAtomAssignmentLabel.js';
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
  const { getAssignmentLabelByDiaIDs } = useExtractAtomAssignmentLabel();
  const assignmentLabel = signal?.assignment || '';

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

  function handleAssignmentLabel() {
    if (!signal?.diaIDs || signal.diaIDs.length === 0) return;

    const isAutoAssignment = !signal.isAutoAssignment;
    const { id, diaIDs } = signal;
    let { assignment = '' } = signal;

    if (isAutoAssignment) {
      const autoLabel = getAssignmentLabelByDiaIDs(diaIDs);
      if (!autoLabel) return;
      assignment = autoLabel;
    }

    dispatch({
      type: 'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
      payload: {
        value: assignment,
        rangeId: row.id,
        signalId: id,
        isAutoAssignment,
      },
    });
  }

  const hasLink = signal?.diaIDs && signal.diaIDs.length > 0;


  return (
    <td {...onHover}>
      <EditableColumn
        value={assignmentLabel}
        onSave={saveHandler}
        style={{ padding: '0.1rem 0.4rem' }}
        type="text"
        clickType={signal ? 'single' : 'none'}
        rightElement={
          <CloseEditOnClick>
            <Button
              variant="minimal"
              icon={signal?.isAutoAssignment ? 'unlink' : 'link'}
              onClick={handleAssignmentLabel}
              disabled={!signal?.isAutoAssignment && !hasLink}
              tooltipProps={{
                content: signal?.isAutoAssignment
                  ? 'Switch to manual assignment'
                  : 'Switch to automatic assignment',
              }}
            />
          </CloseEditOnClick>
        }
      />
    </td>
  );
}

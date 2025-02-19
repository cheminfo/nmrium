import type { CSSProperties, MouseEvent } from 'react';
import { memo } from 'react';

import type { AssignmentsData } from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import type { BaseRangeColumnProps, OnHoverEvent } from '../RangesTableRow.js';

interface SignalAssignmentsColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>,
    OnHoverEvent {
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onLink?: (a: MouseEvent, b: AssignmentsData) => void;
  onUnlink?: (element: MouseEvent, b: boolean) => void;
}

function SignalAssignmentsColumn({
  row,
  onHover,
  assignment,
  highlight,
  onLink,
  onUnlink,
}: SignalAssignmentsColumnProps) {
  // TODO: make sure row is not a lie and remove the optional chaining.
  const diaIDs = row?.tableMetaInfo?.signal?.diaIDs ?? [];

  const tdCss: CSSProperties =
    assignment.isActive || highlight.isActive
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : {};

  function assignHandler(e: MouseEvent) {
    onLink?.(e, assignment);
  }

  return (
    <AssignmentsCell
      {...onHover}
      onClick={assignHandler}
      style={{ padding: '0', ...tdCss }}
      hideRemoveAssignmentButton={!assignment.isActive}
      onRemove={(e) => onUnlink?.(e, false)}
    >
      {(diaIDs?.length > 0 || assignment.isActive) && (
        <span>{diaIDs?.length || 0}</span>
      )}
    </AssignmentsCell>
  );
}

export default memo(SignalAssignmentsColumn);

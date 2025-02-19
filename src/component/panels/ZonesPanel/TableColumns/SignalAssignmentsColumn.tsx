import type { CSSProperties } from 'react';

import type { Axis } from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import type { AssignmentsColumnProps } from '../ZonesTableRow.js';

import { useSignalHighlight } from './SignalAssignmentsColumns.js';

export interface SignalAssignmentsColumnProps extends AssignmentsColumnProps {
  axis: Axis;
}

function SignalAssignmentsColumn({
  rowData,
  onUnlink,
  axis,
}: SignalAssignmentsColumnProps) {
  const {
    signalAssignment,
    handleOnMouseEnter,
    handleOnMouseLeave,
    isHighlighted,
  } = useSignalHighlight(rowData);

  const diaIDs = rowData?.tableMetaInfo?.signal?.[axis]?.diaIDs || [];
  const isAssignmentActive =
    signalAssignment.isActive && signalAssignment.activated?.axis === axis;

  const tdCss: CSSProperties =
    signalAssignment.isActive || isHighlighted(axis)
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : {};

  function handleClick(event: React.MouseEvent<HTMLTableCellElement>) {
    event.stopPropagation();
    signalAssignment.setActive(axis);
  }

  return (
    <AssignmentsCell
      onMouseEnter={() => handleOnMouseEnter(axis)}
      onMouseLeave={() => handleOnMouseLeave(axis)}
      onClick={handleClick}
      style={{ padding: '0', ...tdCss }}
      hideRemoveAssignmentButton={!signalAssignment.isActive}
      onRemove={(e) => onUnlink(e, false, axis)}
    >
      {(diaIDs?.length > 0 || isAssignmentActive) && (
        <span>{diaIDs?.length || 0}</span>
      )}
    </AssignmentsCell>
  );
}

export default SignalAssignmentsColumn;

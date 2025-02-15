/** @jsxImportSource @emotion/react */

import type { CSSProperties } from 'react';

import type {
  AssignmentsData,
  Axis,
} from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import type { ZoneData } from '../hooks/useMapZones.js';

export interface SignalAssignmentsColumnProps {
  rowData: ZoneData;
  assignment: AssignmentsData;
  highlight: {
    isActive: any;
  };
  onHover: () => void;
  onClick: (event: any, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: any, flag: boolean, axis: Axis) => void;
  axis: Axis;
}

function SignalAssignmentsColumn({
  rowData,
  assignment,
  highlight,
  onHover,
  onClick,
  onUnlink,
  axis,
}: SignalAssignmentsColumnProps) {
  const diaIDs = rowData?.tableMetaInfo?.signal?.[axis]?.diaIDs || [];
  const isAssignmentActive =
    assignment.isActive && assignment.activated?.axis === axis;

  const tdCss: CSSProperties =
    assignment.isActive || highlight.isActive
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : {};

  return (
    <AssignmentsCell
      // TODO: Fix this misused spread operator.
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      style={{ padding: '0', ...tdCss }}
      hideRemoveAssignmentButton={!assignment.isActive}
      onRemove={(e) => onUnlink(e, false, axis)}
    >
      {(diaIDs?.length > 0 || isAssignmentActive) && (
        <span>{diaIDs?.length || 0}</span>
      )}
    </AssignmentsCell>
  );
}

export default SignalAssignmentsColumn;

/** @jsxImportSource @emotion/react */

import type { CSSProperties } from 'react';

import type {
  AssignmentsData,
  Axis,
} from '../../../assignment/AssignmentsContext.js';
import {
  removeAssignmentCssStyle,
  RemoveAssignmentsButton,
} from '../../../elements/RemoveAssignmentsButton.js';
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
    <td
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      style={{ padding: '0', ...tdCss }}
      css={!isAssignmentActive && removeAssignmentCssStyle}
    >
      {(diaIDs?.length > 0 || isAssignmentActive) && (
        <>
          <span>{diaIDs?.length || 0}</span>
          <RemoveAssignmentsButton onClick={(e) => onUnlink(e, false, axis)} />
        </>
      )}
    </td>
  );
}

export default SignalAssignmentsColumn;

/** @jsxImportSource @emotion/react */
import type { MouseEvent } from 'react';

import type {
  AssignmentsData,
  Axis,
} from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import type { ZoneData } from '../hooks/useMapZones.js';

function getStyle(flag: boolean, isCompletelyAssigned: boolean) {
  if (flag) {
    return {
      color: 'red',
      fontWeight: 'bold',
    };
  } else if (isCompletelyAssigned) {
    return { color: 'green', fontWeight: 'bold' };
  } else {
    return { color: 'black', fontWeight: 'normal' };
  }
}

export interface ZoneAssignmentColumnProps {
  rowData: ZoneData;
  axis: any;
  onHover: () => void;
  onClick: (event: MouseEvent, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: MouseEvent, flag: boolean, axis: Axis) => void;
  highlight: {
    isActive: any;
  };

  assignment: AssignmentsData;
  rowSpanTags: any;
}

function ZoneAssignmentColumn({
  rowData,
  assignment,
  highlight,
  onHover,
  onClick,
  onUnlink,
  axis,
  rowSpanTags,
}: ZoneAssignmentColumnProps) {
  const diaIDs = rowData?.[axis].diaIDs || []; // diaIds at the level of zone
  const isAssignmentActive =
    assignment.isActive && assignment.activated?.axis === axis;
  const flag =
    isAssignmentActive ||
    (assignment.isOver && assignment.highlighted?.axis === axis) ||
    highlight.isActive;

  let totalNumberOfAtoms = rowData?.[axis]?.nbAtoms || 0;
  for (const signal of rowData?.signals || []) {
    totalNumberOfAtoms += signal?.[axis]?.nbAtoms || 0;
  }

  return (
    <AssignmentsCell
      {...rowSpanTags}
      // TODO: Fix this misused spread operator.
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      hideRemoveAssignmentButton={!assignment.isActive}
      onRemove={(e) => onUnlink(e, true, axis)}
    >
      {(totalNumberOfAtoms > 0 || isAssignmentActive) && (
        <>
          {totalNumberOfAtoms} {' ( '}
          <span style={getStyle(flag, false)}>{diaIDs?.length || 0}</span>
          {' ) '}
        </>
      )}
    </AssignmentsCell>
  );
}

export default ZoneAssignmentColumn;

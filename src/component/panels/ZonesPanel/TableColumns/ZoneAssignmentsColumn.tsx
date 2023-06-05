/** @jsxImportSource @emotion/react */
import { MouseEvent } from 'react';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';
import {
  RemoveAssignmentsButton,
  removeAssignmentCssStyle,
} from '../../../elements/RemoveAssignmentsButton';
import { ZoneData } from '../hooks/useMapZones';

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
    <td
      {...rowSpanTags}
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      css={!isAssignmentActive && removeAssignmentCssStyle}
    >
      {(totalNumberOfAtoms > 0 || isAssignmentActive) && (
        <>
          {totalNumberOfAtoms} {' ( '}
          <span style={getStyle(flag, false)}>{diaIDs?.length || 0}</span>
          {' ) '}
          <RemoveAssignmentsButton onClick={(e) => onUnlink(e, true, axis)} />
        </>
      )}
    </td>
  );
}

export default ZoneAssignmentColumn;

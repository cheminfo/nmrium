import { buildID } from '../../../../data/utilities/Concatenation.js';
import type { Axis } from '../../../assignment/AssignmentsContext.js';
import { useAssignment } from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import { useHighlight } from '../../../highlight/index.js';
import type { AssignmentsColumnProps } from '../ZonesTableRow.js';
import type { ZoneData } from '../hooks/useMapZones.js';

function useZoneHighlight(rowData: ZoneData) {
  const id = rowData.id;
  const zoneAssignment = useAssignment(id);
  const assignedDiaIds = zoneAssignment.assignedDiaIds;

  const highlightZoneX = useHighlight(
    [buildID(id, 'X')].concat(assignedDiaIds.x ?? []),
    {
      type: 'ZONE',
    },
  );

  const highlightZoneY = useHighlight(
    [buildID(id, 'Y')].concat(assignedDiaIds.y ?? []),
    {
      type: 'ZONE',
    },
  );

  function handleOnMouseEnter(axis: Axis) {
    if (axis === 'x') {
      zoneAssignment.highlight('x');
      highlightZoneX.show();
    } else {
      zoneAssignment.highlight('y');
      highlightZoneY.show();
    }
  }
  function handleOnMouseLeave(axis: Axis) {
    zoneAssignment.clearHighlight();

    if (axis === 'x') {
      highlightZoneX.hide();
    } else {
      highlightZoneY.hide();
    }
  }
  function isHighlighted(axis: Axis) {
    return axis === 'x' ? highlightZoneX.isActive : highlightZoneY.isActive;
  }

  return {
    handleOnMouseEnter,
    handleOnMouseLeave,
    zoneAssignment,
    isHighlighted,
  };
}
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

interface ZoneAssignmentColumnProps extends AssignmentsColumnProps {
  axis: Axis;
  rowSpanTags: any;
}

function ZoneAssignmentColumn({
  rowData,
  onUnlink,
  axis,
  rowSpanTags,
}: ZoneAssignmentColumnProps) {
  const {
    zoneAssignment,
    handleOnMouseEnter,
    handleOnMouseLeave,
    isHighlighted,
  } = useZoneHighlight(rowData);
  const diaIDs = rowData[axis].diaIDs ?? []; // diaIds at the level of zone
  const isAssignmentActive =
    zoneAssignment.isActive && zoneAssignment.activated?.axis === axis;
  const flag =
    isAssignmentActive ||
    (zoneAssignment.isHighlighted &&
      zoneAssignment.highlighted?.axis === axis) ||
    isHighlighted(axis);

  let totalNumberOfAtoms = rowData[axis].nbAtoms ?? 0;
  for (const signal of rowData.signals) {
    totalNumberOfAtoms += signal[axis].nbAtoms ?? 0;
  }

  function handleClick(event: React.MouseEvent<HTMLTableCellElement>) {
    event.stopPropagation();
    zoneAssignment.activate(axis);
  }

  return (
    <AssignmentsCell
      {...rowSpanTags}
      onMouseEnter={() => handleOnMouseEnter(axis)}
      onMouseLeave={() => handleOnMouseLeave(axis)}
      onClick={handleClick}
      hideRemoveAssignmentButton={diaIDs.length === 0}
      onRemove={(e) => onUnlink(e, true, axis)}
    >
      {(totalNumberOfAtoms > 0 || isAssignmentActive) && (
        <>
          {totalNumberOfAtoms} {' ( '}
          <span style={getStyle(flag, false)}>{diaIDs.length}</span>
          {' ) '}
        </>
      )}
    </AssignmentsCell>
  );
}

export default ZoneAssignmentColumn;

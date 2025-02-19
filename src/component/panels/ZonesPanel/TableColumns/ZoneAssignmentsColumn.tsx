import { buildID } from '../../../../data/utilities/Concatenation.js';
import type { Axis } from '../../../assignment/AssignmentsContext.js';
import { useAssignment } from '../../../assignment/AssignmentsContext.js';
import { AssignmentsCell } from '../../../elements/AssignmentsCell.js';
import { useHighlight } from '../../../highlight/index.js';
import type { AssignmentsColumnProps } from '../ZonesTableRow.js';
import type { ZoneData } from '../hooks/useMapZones.js';

export function useZoneHighlight(rowData: ZoneData) {
  const zoneAssignment = useAssignment(rowData.id);

  const highlightZoneX = useHighlight(
    [buildID(zoneAssignment.id, 'X')].concat(zoneAssignment.assigned?.x || []),
  );

  const highlightZoneY = useHighlight(
    [buildID(zoneAssignment.id, 'Y')].concat(zoneAssignment.assigned?.y || []),
  );

  function handleOnMouseEnter(axis: Axis) {
    if (axis === 'x') {
      zoneAssignment.show('x');
      highlightZoneX.show();
    } else {
      zoneAssignment.show('y');
      highlightZoneY.show();
    }
  }
  function handleOnMouseLeave(axis: Axis) {
    zoneAssignment.hide();

    if (axis === 'x') {
      highlightZoneX.hide();
    } else {
      highlightZoneY.hide();
    }
  }
  function isHighlighted(axis: Axis) {
    return axis === 'x' ? highlightZoneX.isActive : highlightZoneY?.isActive;
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

export interface ZoneAssignmentColumnProps extends AssignmentsColumnProps {
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
  const diaIDs = rowData?.[axis].diaIDs || []; // diaIds at the level of zone
  const isAssignmentActive =
    zoneAssignment.isActive && zoneAssignment.activated?.axis === axis;
  const flag =
    isAssignmentActive ||
    (zoneAssignment.isOver && zoneAssignment.highlighted?.axis === axis) ||
    isHighlighted(axis);

  let totalNumberOfAtoms = rowData?.[axis]?.nbAtoms || 0;
  for (const signal of rowData?.signals || []) {
    totalNumberOfAtoms += signal?.[axis]?.nbAtoms || 0;
  }

  function handleClick(event: React.MouseEvent<HTMLTableCellElement>) {
    event.stopPropagation();
    zoneAssignment.setActive(axis);
  }

  return (
    <AssignmentsCell
      {...rowSpanTags}
      onMouseEnter={() => handleOnMouseEnter(axis)}
      onMouseLeave={() => handleOnMouseLeave(axis)}
      onClick={handleClick}
      hideRemoveAssignmentButton={!zoneAssignment.isActive}
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

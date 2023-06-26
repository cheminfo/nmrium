import { Fragment } from 'react';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';
import { ZoneData } from '../hooks/useMapZones';

import ZoneAssignmentColumn from './ZoneAssignmentsColumn';

interface ZoneAssignmentsColumnsProps {
  rowData: ZoneData;
  onHoverZoneX: any;
  onHoverZoneY: any;
  onClick: (event: any, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: any, flag: boolean, axis: Axis) => void;
  rowSpanTags: any;
  assignmentZone: AssignmentsData;
  highlightZoneX: {
    isActive: any;
  };
  highlightZoneY: {
    isActive: any;
  };
}

function ZoneAssignmentsColumns({
  rowData,
  assignmentZone,
  onHoverZoneX,
  onHoverZoneY,
  rowSpanTags,
  onClick,
  onUnlink,
  highlightZoneX,
  highlightZoneY,
}: ZoneAssignmentsColumnsProps) {
  return (
    <Fragment>
      <ZoneAssignmentColumn
        rowData={rowData}
        assignment={assignmentZone}
        highlight={highlightZoneX}
        onHover={onHoverZoneX}
        onClick={onClick}
        onUnlink={onUnlink}
        axis={'x'}
        rowSpanTags={rowSpanTags}
      />
      <ZoneAssignmentColumn
        rowData={rowData}
        assignment={assignmentZone}
        highlight={highlightZoneY}
        onHover={onHoverZoneY}
        onClick={onClick}
        onUnlink={onUnlink}
        axis={'y'}
        rowSpanTags={rowSpanTags}
      />
    </Fragment>
  );
}

export default ZoneAssignmentsColumns;

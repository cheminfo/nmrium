import { Fragment } from 'react';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';

import { RowDataProps } from './ActionsColumn';
import ZoneAssignmentColumn from './ZoneAssignmentsColumn';

interface ZoneAssignmentsColumnsProps {
  rowData: RowDataProps;
  onHoverZoneX: any;
  onHoverZoneY: any;
  onClick: (a: any, b: any, c: any) => void;
  onUnlink: (a: any, b: any, c: any) => void;
  rowSpanTags: any;
  showUnlinkButtonZoneX: boolean;
  showUnlinkButtonZoneY: boolean;
  setShowUnlinkButtonZoneX: (element: boolean) => void;
  setShowUnlinkButtonZoneY: (element: boolean) => void;
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
  showUnlinkButtonZoneX,
  showUnlinkButtonZoneY,
  setShowUnlinkButtonZoneX,
  setShowUnlinkButtonZoneY,
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
        showUnlinkButton={showUnlinkButtonZoneX}
        setShowUnlinkButton={setShowUnlinkButtonZoneX}
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
        showUnlinkButton={showUnlinkButtonZoneY}
        setShowUnlinkButton={setShowUnlinkButtonZoneY}
        rowSpanTags={rowSpanTags}
      />
    </Fragment>
  );
}

export default ZoneAssignmentsColumns;

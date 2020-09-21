import React, { Fragment } from 'react';

import ZoneAssignmentColumn from './ZoneAssignmentsColumn';

const ZoneAssignmentsColumns = ({
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
}) => {
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
};

export default ZoneAssignmentsColumns;

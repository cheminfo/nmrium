import type { AssignmentsColumnProps } from '../ZonesTableRow.js';

import ZoneAssignmentColumn from './ZoneAssignmentsColumn.js';

interface ZoneAssignmentsColumnsProps extends AssignmentsColumnProps {
  rowSpanTags: any;
}

function ZoneAssignmentsColumns({
  rowData,
  rowSpanTags,
  onUnlink,
}: ZoneAssignmentsColumnsProps) {
  return (
    <>
      <ZoneAssignmentColumn
        rowData={rowData}
        onUnlink={onUnlink}
        axis="x"
        rowSpanTags={rowSpanTags}
      />
      <ZoneAssignmentColumn
        rowData={rowData}
        onUnlink={onUnlink}
        axis="y"
        rowSpanTags={rowSpanTags}
      />
    </>
  );
}

export default ZoneAssignmentsColumns;

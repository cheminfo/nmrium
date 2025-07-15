import { buildID } from '../../../../data/utilities/Concatenation.js';
import type { Axis } from '../../../assignment/AssignmentsContext.js';
import { useAssignment } from '../../../assignment/AssignmentsContext.js';
import { useHighlight } from '../../../highlight/index.js';
import type { AssignmentsColumnProps } from '../ZonesTableRow.js';
import type { ZoneData } from '../hooks/useMapZones.js';

import SignalAssignmentsColumn from './SignalAssignmentsColumn.js';

export function useSignalHighlight(rowData: ZoneData) {
  const signalKey = String(rowData.tableMetaInfo.id);
  const signalAssignment = useAssignment(signalKey);

  const highlightSignalX = useHighlight(
    [buildID(signalKey, 'X')].concat(
      signalAssignment.assignedDiaIds?.x || [],
      buildID(signalKey, 'Crosshair'),
    ),
    { type: 'SIGNAL' },
  );
  const highlightSignalY = useHighlight(
    [buildID(signalKey, 'Y')].concat(
      signalAssignment.assignedDiaIds?.y || [],
      buildID(signalKey, 'Crosshair'),
    ),
    { type: 'SIGNAL' },
  );

  function handleOnMouseEnter(axis: Axis) {
    if (axis === 'x') {
      signalAssignment.highlight('x');
      highlightSignalX.show();
    } else {
      signalAssignment.highlight('y');
      highlightSignalY.show();
    }
  }
  function handleOnMouseLeave(axis: Axis) {
    signalAssignment.clearHighlight();

    if (axis === 'x') {
      highlightSignalX.hide();
    } else {
      highlightSignalY.hide();
    }
  }
  function isHighlighted(axis: Axis) {
    return axis === 'x'
      ? highlightSignalX.isActive
      : highlightSignalY?.isActive;
  }

  return {
    handleOnMouseEnter,
    handleOnMouseLeave,
    signalAssignment,
    isHighlighted,
  };
}

function SignalAssignmentsColumns({
  rowData,
  onUnlink,
}: AssignmentsColumnProps) {
  return (
    <>
      <SignalAssignmentsColumn rowData={rowData} onUnlink={onUnlink} axis="x" />
      <SignalAssignmentsColumn rowData={rowData} onUnlink={onUnlink} axis="y" />
    </>
  );
}

export default SignalAssignmentsColumns;

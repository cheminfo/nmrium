import { buildID } from '../../../../data/utilities/Concatenation.js';
import { useAssignment } from '../../../assignment/AssignmentsContext.js';
import type { Axis } from '../../../assignment/AssignmentsContext.js';
import { useHighlight } from '../../../highlight/index.js';
import type { AssignmentsColumnProps } from '../ZonesTableRow.js';
import type { ZoneData } from '../hooks/useMapZones.js';

import SignalAssignmentsColumn from './SignalAssignmentsColumn.js';

export function useSignalHighlight(rowData: ZoneData) {
  const signalAssignment = useAssignment(rowData.tableMetaInfo.id);

  const highlightSignalX = useHighlight(
    [buildID(signalAssignment.id, 'X')].concat(
      signalAssignment.assigned?.x || [],
      buildID(signalAssignment.id, 'Crosshair'),
    ),
  );
  const highlightSignalY = useHighlight(
    [buildID(signalAssignment.id, 'Y')].concat(
      signalAssignment.assigned?.y || [],
      buildID(signalAssignment.id, 'Crosshair'),
    ),
  );

  function handleOnMouseEnter(axis: Axis) {
    if (axis === 'x') {
      signalAssignment.show('x');
      highlightSignalX.show();
    } else {
      signalAssignment.show('y');
      highlightSignalY.show();
    }
  }
  function handleOnMouseLeave(axis: Axis) {
    signalAssignment.hide();

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

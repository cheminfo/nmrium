import { Fragment } from 'react';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';
import { ZoneData } from '../hooks/useMapZones';

import SignalAssignmentsColumn from './SignalAssignmentsColumn';

interface SignalAssignmentsColumnsProps {
  rowData: ZoneData;
  onHoverSignalX: any;
  onHoverSignalY: any;
  onClick: (event: any, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: any, flag: boolean, axis: Axis) => void;
  highlightSignalX: {
    isActive: any;
  };
  highlightSignalY: {
    isActive: any;
  };
  assignmentSignal: AssignmentsData;
}

function SignalAssignmentsColumns({
  rowData,
  assignmentSignal,
  onHoverSignalX,
  onHoverSignalY,
  onClick,
  onUnlink,
  highlightSignalX,
  highlightSignalY,
}: SignalAssignmentsColumnsProps) {
  return (
    <Fragment>
      <SignalAssignmentsColumn
        rowData={rowData}
        assignment={assignmentSignal}
        highlight={highlightSignalX}
        onHover={onHoverSignalX}
        onClick={onClick}
        onUnlink={onUnlink}
        axis="x"
      />
      <SignalAssignmentsColumn
        rowData={rowData}
        assignment={assignmentSignal}
        highlight={highlightSignalY}
        onHover={onHoverSignalY}
        onClick={onClick}
        onUnlink={onUnlink}
        axis="y"
      />
    </Fragment>
  );
}

export default SignalAssignmentsColumns;

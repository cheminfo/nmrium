import { Fragment } from 'react';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';

import { RowDataProps } from './ActionsColumn';
import SignalAssignmentsColumn from './SignalAssignmentsColumn';

interface SignalAssignmentsColumnsProps {
  rowData: RowDataProps;
  onHoverSignalX: any;
  onHoverSignalY: any;
  showUnlinkButtonSignalX: boolean;
  showUnlinkButtonSignalY: boolean;
  setShowUnlinkButtonSignalX: (element: boolean) => void;
  setShowUnlinkButtonSignalY: (element: boolean) => void;
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
  showUnlinkButtonSignalX,
  showUnlinkButtonSignalY,
  setShowUnlinkButtonSignalX,
  setShowUnlinkButtonSignalY,
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
        showUnlinkButton={showUnlinkButtonSignalX}
        setShowUnlinkButton={setShowUnlinkButtonSignalX}
      />
      <SignalAssignmentsColumn
        rowData={rowData}
        assignment={assignmentSignal}
        highlight={highlightSignalY}
        onHover={onHoverSignalY}
        onClick={onClick}
        onUnlink={onUnlink}
        axis="y"
        showUnlinkButton={showUnlinkButtonSignalY}
        setShowUnlinkButton={setShowUnlinkButtonSignalY}
      />
    </Fragment>
  );
}

export default SignalAssignmentsColumns;

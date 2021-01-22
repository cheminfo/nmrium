import { Fragment } from 'react';

import SignalAssignmentsColumn from './SignalAssignmentsColumn';

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
}) {
  return (
    <Fragment>
      <SignalAssignmentsColumn
        rowData={rowData}
        assignment={assignmentSignal}
        highlight={highlightSignalX}
        onHover={onHoverSignalX}
        onClick={onClick}
        onUnlink={onUnlink}
        axis={'x'}
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
        axis={'y'}
        showUnlinkButton={showUnlinkButtonSignalY}
        setShowUnlinkButton={setShowUnlinkButtonSignalY}
      />
    </Fragment>
  );
}

export default SignalAssignmentsColumns;

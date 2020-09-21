/** @jsx jsx */
import { jsx } from '@emotion/core';
import lodash from 'lodash';
import { useMemo, useCallback, useState } from 'react';

import { useAssignment } from '../../assignment';
import { useHighlight } from '../../highlight';
import { buildID } from '../extra/utilities/Concatenation';

import ActionsColumn from './TableColumns/ActionsColumn';
import SignalAssignmentsColumns from './TableColumns/SignalAssignmentsColumns';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn';
import ZoneAssignmentsColumns from './TableColumns/ZoneAssignmentsColumns';

const HighlightedRowStyle = { backgroundColor: '#ff6f0057' };

const ConstantlyHighlightedRowStyle = { backgroundColor: '#f5f5dc' };

const ZonesTableRow = ({
  rowData,
  onUnlink,
  onContextMenu,
  // preferences,
}) => {
  const assignmentZone = useAssignment(rowData.id);
  const highlightZone = useHighlight(
    [assignmentZone.id],
    // .concat(
    //   assignmentZone.assigned.x || [],
    //   assignmentZone.assigned.y || [],
    // ),
  );
  const highlightZoneX = useHighlight(
    [buildID(assignmentZone.id, 'X')].concat(assignmentZone.assigned.x || []),
  );
  const highlightZoneY = useHighlight(
    [buildID(assignmentZone.id, 'Y')].concat(assignmentZone.assigned.y || []),
  );

  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignalX = useHighlight(
    [buildID(assignmentSignal.id, 'X')].concat(
      assignmentSignal.assigned.x || [],
    ),
  );
  const highlightSignalY = useHighlight(
    [buildID(assignmentSignal.id, 'Y')].concat(
      assignmentSignal.assigned.y || [],
    ),
  );

  const [showUnlinkButtonZoneX, setShowUnlinkButtonZoneX] = useState(false);
  const [showUnlinkButtonZoneY, setShowUnlinkButtonZoneY] = useState(false);
  const [showUnlinkButtonSignalX, setShowUnlinkButtonSignalX] = useState(false);
  const [showUnlinkButtonSignalY, setShowUnlinkButtonSignalY] = useState(false);

  const rowSpanTags = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style:
        lodash.get(rowData, 'tableMetaInfo.hide', false) === true
          ? { display: 'none' }
          : null,
    };
  }, [rowData]);

  const unlinkHandler = useCallback(
    (e, isOnZoneLevel, axis) => {
      // event handling here in case of unlink button clicked
      if (e) {
        e.stopPropagation();
      }
      onUnlink(rowData, isOnZoneLevel, rowData.tableMetaInfo.signalIndex, axis);
      if (axis === 'x') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneX(false);
            assignmentZone.removeAll('x');
          } else {
            setShowUnlinkButtonSignalX(false);
            assignmentSignal.removeAll('x');
          }
        } else {
          setShowUnlinkButtonZoneX(false);
          setShowUnlinkButtonSignalX(false);
        }
      } else if (axis === 'y') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneY(false);
            assignmentZone.removeAll('y');
          } else {
            setShowUnlinkButtonSignalY(false);
            assignmentSignal.removeAll('y');
          }
        } else {
          setShowUnlinkButtonZoneY(false);
          setShowUnlinkButtonSignalY(false);
        }
      } else {
        setShowUnlinkButtonZoneX(false);
        assignmentZone.removeAll('x');
        setShowUnlinkButtonSignalX(false);
        assignmentSignal.removeAll('x');
        setShowUnlinkButtonZoneY(false);
        assignmentZone.removeAll('y');
        setShowUnlinkButtonSignalY(false);
        assignmentSignal.removeAll('y');
      }
    },
    [assignmentSignal, assignmentZone, onUnlink, rowData],
  );

  const clickHandler = useCallback((e, assignment, axis) => {
    assignment.onClick(e, axis);
  }, []);

  const onHoverZoneX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.onMouseEnter('x');
        highlightZoneX.show();
      },
      onMouseLeave: () => {
        assignmentZone.onMouseLeave('x');
        highlightZoneX.hide();
      },
    };
  }, [assignmentZone, highlightZoneX]);

  const onHoverZoneY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.onMouseEnter('y');
        highlightZoneY.show();
      },
      onMouseLeave: () => {
        assignmentZone.onMouseLeave('y');
        highlightZoneY.hide();
      },
    };
  }, [assignmentZone, highlightZoneY]);

  const onHoverSignalX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('x');
        highlightSignalX.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('x');
        highlightSignalX.hide();
      },
    };
  }, [assignmentSignal, highlightSignalX]);

  const onHoverSignalY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('y');
        highlightSignalY.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('y');
        highlightSignalY.hide();
      },
    };
  }, [assignmentSignal, highlightSignalY]);

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, rowData)}
      style={
        highlightZone.isActive || assignmentZone.isActive
          ? HighlightedRowStyle
          : lodash.get(
              rowData,
              'tableMetaInfo.isConstantlyHighlighted',
              false,
            ) === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlightZone.onHover}
    >
      <td {...rowSpanTags}>{rowData.tableMetaInfo.rowIndex + 1}</td>
      <SignalDeltaColumn
        rowData={rowData}
        onHoverSignalX={onHoverSignalX}
        onHoverSignalY={onHoverSignalY}
      />
      <SignalAssignmentsColumns
        rowData={rowData}
        assignmentSignal={assignmentSignal}
        onHoverSignalX={onHoverSignalX}
        onHoverSignalY={onHoverSignalY}
        showUnlinkButtonSignalX={showUnlinkButtonSignalX}
        showUnlinkButtonSignalY={showUnlinkButtonSignalY}
        setShowUnlinkButtonSignalX={(show) => setShowUnlinkButtonSignalX(show)}
        setShowUnlinkButtonSignalY={(show) => setShowUnlinkButtonSignalY(show)}
        onClick={clickHandler}
        onUnlink={unlinkHandler}
        highlightSignalX={highlightSignalX}
        highlightSignalY={highlightSignalY}
      />
      <ZoneAssignmentsColumns
        rowData={rowData}
        assignmentZone={assignmentZone}
        onHoverZoneX={onHoverZoneX}
        onHoverZoneY={onHoverZoneY}
        showUnlinkButtonZoneX={showUnlinkButtonZoneX}
        showUnlinkButtonZoneY={showUnlinkButtonZoneY}
        setShowUnlinkButtonZoneX={(show) => setShowUnlinkButtonZoneX(show)}
        setShowUnlinkButtonZoneY={(show) => setShowUnlinkButtonZoneY(show)}
        rowSpanTags={rowSpanTags}
        onClick={clickHandler}
        onUnlink={unlinkHandler}
        highlightZoneX={highlightZoneX}
        highlightZoneY={highlightZoneY}
      />
      <ActionsColumn rowData={rowData} rowSpanTags={rowSpanTags} />
    </tr>
  );
};

export default ZonesTableRow;

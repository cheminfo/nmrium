/** @jsxImportSource @emotion/react */

import lodashGet from 'lodash/get';
import {
  CSSProperties,
  useMemo,
  useCallback,
  useState,
  MouseEvent,
} from 'react';

import { buildID } from '../../../data/utilities/Concatenation';
import {
  Axis,
  useAssignment,
  AssignmentsData,
} from '../../assignment/AssignmentsContext';
import { useHighlight } from '../../highlight';

import ActionsColumn, { RowDataProps } from './TableColumns/ActionsColumn';
import SignalAssignmentsColumns from './TableColumns/SignalAssignmentsColumns';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn';
import ZoneAssignmentsColumns from './TableColumns/ZoneAssignmentsColumns';

const HighlightedRowStyle: CSSProperties = { backgroundColor: '#ff6f0057' };

const ConstantlyHighlightedRowStyle = { backgroundColor: '#f5f5dc' };

interface ZonesTableRowProps {
  rowData: RowDataProps;
  onUnlink: (
    rowData: RowDataProps,
    isOnZoneLevel: boolean,
    signalIndex: any,
    axis: Axis,
  ) => void;
  onContextMenu: (a: any, rowData: RowDataProps) => void;
  rowIndex: number;
  format: { x: string; y: string };
}

function ZonesTableRow({
  rowData,
  onUnlink,
  onContextMenu,
  rowIndex,
  format,
}: ZonesTableRowProps) {
  const assignmentZone = useAssignment(rowData.id);
  const highlightZone = useHighlight([assignmentZone.id]);
  const highlightZoneX = useHighlight(
    [buildID(assignmentZone.id, 'X')].concat(assignmentZone.assigned?.x || []),
  );

  const highlightZoneY = useHighlight(
    [buildID(assignmentZone.id, 'Y')].concat(assignmentZone.assigned?.y || []),
  );

  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignalX = useHighlight(
    [buildID(assignmentSignal.id, 'X')].concat(
      assignmentSignal.assigned?.x || [],
      buildID(assignmentSignal.id, 'Crosshair'),
    ),
  );
  const highlightSignalY = useHighlight(
    [buildID(assignmentSignal.id, 'Y')].concat(
      assignmentSignal.assigned?.y || [],
      buildID(assignmentSignal.id, 'Crosshair'),
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
        lodashGet(rowData, 'tableMetaInfo.hide', false) === true
          ? { display: 'none' }
          : null,
    };
  }, [rowData]);

  const unlinkHandler = useCallback(
    (event: MouseEvent, isOnZoneLevel: boolean, axis: Axis) => {
      // event handling here in case of unlink button clicked
      if (event) {
        event.stopPropagation();
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

  const clickHandler = useCallback(
    (event: MouseEvent, assignment: AssignmentsData, axis: Axis) => {
      event.stopPropagation();
      assignment.setActive(axis);
    },
    [],
  );

  const onHoverZoneX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.show('x');
        highlightZoneX.show();
      },
      onMouseLeave: () => {
        assignmentZone.hide();
        highlightZoneX.hide();
      },
    };
  }, [assignmentZone, highlightZoneX]);

  const onHoverZoneY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.show('y');
        highlightZoneY.show();
      },
      onMouseLeave: () => {
        assignmentZone.hide();
        highlightZoneY.hide();
      },
    };
  }, [assignmentZone, highlightZoneY]);

  const onHoverSignalX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.show('x');
        highlightSignalX.show();
      },
      onMouseLeave: () => {
        assignmentSignal.hide();
        highlightSignalX.hide();
      },
    };
  }, [assignmentSignal, highlightSignalX]);

  const onHoverSignalY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.show('y');
        highlightSignalY.show();
      },
      onMouseLeave: () => {
        assignmentSignal.hide();
        highlightSignalY.hide();
      },
    };
  }, [assignmentSignal, highlightSignalY]);

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, rowData)}
      style={
        highlightZone.isActive || assignmentZone.isActive
          ? (HighlightedRowStyle as any)
          : lodashGet(
              rowData,
              'tableMetaInfo.isConstantlyHighlighted',
              false,
            ) === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlightZone.onHover}
    >
      <td {...(rowSpanTags as any)}>{rowIndex + 1}</td>
      <SignalDeltaColumn
        rowData={rowData}
        onHoverSignalX={onHoverSignalX}
        onHoverSignalY={onHoverSignalY}
        format={format}
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
}

export default ZonesTableRow;

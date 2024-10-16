/** @jsxImportSource @emotion/react */

import lodashGet from 'lodash/get.js';
import type { CSSProperties, MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../data/utilities/Concatenation.js';
import type {
  AssignmentsData,
  Axis,
} from '../../assignment/AssignmentsContext.js';
import { useAssignment } from '../../assignment/AssignmentsContext.js';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.js';
import type { TableContextMenuProps } from '../../elements/ReactTable/ReactTable.js';
import { useHighlight } from '../../highlight/index.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import ActionsColumn from './TableColumns/ActionsColumn.js';
import SignalAssignmentsColumns from './TableColumns/SignalAssignmentsColumns.js';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn.js';
import { ZoneAssignmentLabelColumn } from './TableColumns/ZoneAssignmentLabelColumn.js';
import ZoneAssignmentsColumns from './TableColumns/ZoneAssignmentsColumns.js';
import type { ZoneData } from './hooks/useMapZones.js';

const HighlightedRowStyle: CSSProperties = { backgroundColor: '#ff6f0057' };

const ConstantlyHighlightedRowStyle = { backgroundColor: '#f5f5dc' };

interface ZonesTableRowProps extends TableContextMenuProps {
  rowData: ZoneData;
  onUnlink: (
    rowData: ZoneData,
    isOnZoneLevel: boolean,
    signalIndex: any,
    axis: Axis,
  ) => void;
  rowIndex: number;
  nucleus: string;
}

function ZonesTableRow({
  rowData,
  onUnlink,
  contextMenu = [],
  onContextMenuSelect,
  rowIndex,
  nucleus,
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
  const {
    showSerialNumber,
    showAssignment,
    showKind,
    showDeleteAction,
    showEditAction,
    showZoomAction,
    showAssignmentLabel,
  } = usePanelPreferences('zones', nucleus);

  const rowSpanTags = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style: lodashGet(rowData, 'tableMetaInfo.hide', false)
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
            assignmentZone.removeAll('x');
          } else {
            assignmentSignal.removeAll('x');
          }
        }
      } else if (axis === 'y') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            assignmentZone.removeAll('y');
          } else {
            assignmentSignal.removeAll('y');
          }
        }
      } else {
        assignmentZone.removeAll('x');
        assignmentSignal.removeAll('x');
        assignmentZone.removeAll('y');
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
    <ContextMenu
      options={contextMenu}
      onSelect={(selected) => onContextMenuSelect?.(selected, rowData)}
      as="tr"
      style={
        highlightZone.isActive || assignmentZone.isActive
          ? (HighlightedRowStyle as any)
          : lodashGet(rowData, 'tableMetaInfo.isConstantlyHighlighted', false)
            ? ConstantlyHighlightedRowStyle
            : null
      }
      {...highlightZone.onHover}
    >
      {showSerialNumber && <td {...(rowSpanTags as any)}>{rowIndex + 1}</td>}
      {showAssignmentLabel && <ZoneAssignmentLabelColumn rowData={rowData} />}
      <SignalDeltaColumn
        rowData={rowData}
        onHoverSignalX={onHoverSignalX}
        onHoverSignalY={onHoverSignalY}
        nucleus={nucleus}
      />
      {showAssignment && (
        <>
          <SignalAssignmentsColumns
            rowData={rowData}
            assignmentSignal={assignmentSignal}
            onHoverSignalX={onHoverSignalX}
            onHoverSignalY={onHoverSignalY}
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
            rowSpanTags={rowSpanTags}
            onClick={clickHandler}
            onUnlink={unlinkHandler}
            highlightZoneX={highlightZoneX}
            highlightZoneY={highlightZoneY}
          />
        </>
      )}
      <ActionsColumn
        rowData={rowData}
        rowSpanTags={rowSpanTags}
        {...{ showKind, showDeleteAction, showEditAction, showZoomAction }}
      />
    </ContextMenu>
  );
}

export default ZonesTableRow;

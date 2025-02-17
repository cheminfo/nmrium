/** @jsxImportSource @emotion/react */

import lodashGet from 'lodash/get.js';
import type { Zones2DNucleusPreferences } from 'nmr-load-save';
import type { CSSProperties, MouseEvent } from 'react';

import { useAssignment } from '../../assignment/AssignmentsContext.js';
import type { Axis } from '../../assignment/AssignmentsContext.js';
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

export type OnHover = Pick<
  React.HTMLAttributes<HTMLTableCellElement>,
  'onMouseEnter' | 'onMouseLeave'
>;

export interface AssignmentsColumnProps {
  rowData: ZoneData;
  onUnlink: (event: any, flag: boolean, axis: Axis) => void;
}

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

  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);

  const {
    showSerialNumber,
    showAssignment,
    showKind,
    showDeleteAction,
    showEditAction,
    showZoomAction,
    showAssignmentLabel,
  } = usePanelPreferences('zones', nucleus) as Zones2DNucleusPreferences;

  const rowSpanTags = {
    rowSpan: rowData.tableMetaInfo.rowSpan,
    style: lodashGet(rowData, 'tableMetaInfo.hide', false)
      ? { display: 'none' }
      : null,
  };

  function unlinkHandler(
    event: MouseEvent,
    isOnZoneLevel: boolean,
    axis: Axis,
  ) {
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
  }

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
      <SignalDeltaColumn rowData={rowData} nucleus={nucleus} />
      {showAssignment && (
        <>
          <SignalAssignmentsColumns
            rowData={rowData}
            onUnlink={unlinkHandler}
          />
          <ZoneAssignmentsColumns
            rowData={rowData}
            rowSpanTags={rowSpanTags}
            onUnlink={unlinkHandler}
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

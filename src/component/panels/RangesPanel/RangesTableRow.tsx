import type { Info1D } from '@zakodium/nmr-types';
import type { WorkSpacePanelPreferences } from '@zakodium/nmrium-core';
import type { CSSProperties, MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';

import type { AssignmentsData } from '../../assignment/AssignmentsContext.js';
import {
  useAssignment,
  useAssignmentContext,
} from '../../assignment/AssignmentsContext.js';
import { filterAssignedIDs } from '../../assignment/utilities/filterAssignedIDs.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.js';
import type { TableContextMenuProps } from '../../elements/ReactTable/ReactTable.js';
import { useHighlight, useHighlightData } from '../../highlight/index.js';

import AbsoluteColumn from './TableColumns/AbsoluteColumn.js';
import ActionsColumn from './TableColumns/ActionsColumn.js';
import CouplingColumn from './TableColumns/CouplingColumn.js';
import { RangeAssignmentColumn } from './TableColumns/RangeAssignmentColumn.js';
import RangeAssignmentsColumn from './TableColumns/RangeAssignmentsColumn.js';
import RangeColumn from './TableColumns/RangeColumn.js';
import RelativeColumn from './TableColumns/RelativeColumn.js';
import SignalAssignmentsColumn from './TableColumns/SignalAssignmentsColumn.js';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn.js';
import SignalDeltaHzColumn from './TableColumns/SignalDeltaHzColumn.js';
import type { RangeData } from './hooks/useMapRanges.js';

const HighlightedRowStyle = {
  backgroundColor: '#ff6f0057',
};

const ConstantlyHighlightedRowStyle = {
  backgroundColor: '#f5f5dc',
};

interface RangesTableRowProps extends TableContextMenuProps {
  rowData: any;
  preferences: WorkSpacePanelPreferences['ranges'];
  info: Info1D;
}

export interface BaseRangeColumnProps {
  row: RangeData;
  format: string;
}

export interface OnHoverEvent {
  onHover: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export interface RowSpanTags {
  rowSpanTags: {
    rowSpan: any;
    style: CSSProperties;
  };
}

export type RangeColumnProps = BaseRangeColumnProps &
  OnHoverEvent &
  RowSpanTags;

function RangesTableRow({
  rowData,
  onContextMenuSelect,
  contextMenu = [],
  preferences,
  info,
}: RangesTableRowProps) {
  const dispatch = useDispatch();
  const assignmentData = useAssignmentContext();
  const rangeKey = rowData.id;
  const assignmentRange = useAssignment(rangeKey);
  const highlightRange = useHighlight(
    [rangeKey].concat(assignmentRange.assignedDiaIds?.x || []).concat(
      filterAssignedIDs(
        assignmentData.data,
        rowData.signals.map((_signal: any) => _signal.id),
      ),
    ),
    { type: 'RANGE' },
  );
  const highlightRangeAssignmentsColumn = useHighlight(
    assignmentRange.assignedDiaIds?.x || [],
    { type: 'RANGE' },
  );
  const signalKey = rowData?.tableMetaInfo?.id || '';
  const assignmentSignal = useAssignment(signalKey);

  const highlightSignal = useHighlight(
    signalKey
      ? [signalKey].concat(assignmentSignal.assignedDiaIds?.x || [])
      : [],
    { type: 'SIGNAL' },
  );
  const highlightData = useHighlightData();

  const rowSpanTags: any = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style: rowData.tableMetaInfo.hide ? { display: 'none' } : undefined,
    };
  }, [rowData.tableMetaInfo]);

  const unlinkHandler = useCallback(
    (e: MouseEvent, isOnRangeLevel: boolean) => {
      // stop propagation here to prevent enabling/disabling the assignment mode at the same time
      if (e) {
        e.stopPropagation();
      }

      if (isOnRangeLevel !== undefined) {
        const { id: rangeKey, tableMetaInfo } = rowData;

        const signalIndex = isOnRangeLevel ? -1 : tableMetaInfo.signalIndex;

        dispatch({
          type: 'UNLINK_RANGE',
          payload: {
            rangeKey,
            signalIndex,
          },
        });
      }
    },
    [dispatch, rowData],
  );

  const linkHandler = useCallback(
    (e: MouseEvent, assignment: AssignmentsData) => {
      e.stopPropagation();
      assignment.activate('x');
    },
    [],
  );

  const onHoverRange = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.highlight('x');
        highlightRange.show();
      },
      onMouseLeave: () => {
        assignmentRange.clearHighlight();
        highlightRange.hide();
      },
    };
  }, [assignmentRange, highlightRange]);

  const onHoverRangeAssignmentsColumn = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.highlight('x');
        highlightRangeAssignmentsColumn.show();
      },
      onMouseLeave: () => {
        assignmentRange.clearHighlight();
        highlightRangeAssignmentsColumn.hide();
      },
    };
  }, [assignmentRange, highlightRangeAssignmentsColumn]);

  const onHoverSignal = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.highlight('x');
        highlightSignal.show();
      },
      onMouseLeave: () => {
        assignmentSignal.clearHighlight();
        highlightSignal.hide();
      },
    };
  }, [assignmentSignal, highlightSignal]);

  const trStyle = useMemo(() => {
    return highlightRange.isActive || assignmentRange.isActive
      ? HighlightedRowStyle
      : rowData.tableMetaInfo.isConstantlyHighlighted
        ? ConstantlyHighlightedRowStyle
        : undefined;
  }, [
    assignmentRange.isActive,
    highlightRange.isActive,
    rowData.tableMetaInfo.isConstantlyHighlighted,
  ]);

  return (
    <ContextMenu
      options={contextMenu}
      onSelect={(selected: any) => onContextMenuSelect?.(selected, rowData)}
      as="tr"
      style={trStyle}
    >
      {preferences.showSerialNumber && (
        <td {...rowSpanTags} {...onHoverRange}>
          {rowData.tableMetaInfo.rowIndex + 1}
        </td>
      )}
      {preferences.showAssignmentLabel && (
        <RangeAssignmentColumn
          row={rowData}
          onHover={onHoverRange}
          rowSpanTags={rowSpanTags}
        />
      )}

      {preferences.from.show && (
        <RangeColumn
          value={rowData.from}
          rowSpanTags={rowSpanTags}
          onHover={onHoverRange}
          format={preferences.from.format}
        />
      )}
      {preferences.to.show && (
        <RangeColumn
          value={rowData.to}
          rowSpanTags={rowSpanTags}
          onHover={onHoverRange}
          format={preferences.to.format}
        />
      )}

      {preferences.deltaPPM.show && (
        <SignalDeltaColumn
          row={rowData}
          rowSpanTags={rowSpanTags}
          onHover={onHoverSignal}
          format={preferences.deltaPPM.format}
        />
      )}
      {preferences.deltaHz.show && (
        <SignalDeltaHzColumn
          row={rowData}
          rowSpanTags={rowSpanTags}
          onHover={onHoverSignal}
          format={preferences.deltaHz.format}
          info={info}
        />
      )}

      {preferences.relative.show && (
        <RelativeColumn
          row={rowData}
          rowSpanTags={rowSpanTags}
          onHover={onHoverRange}
          format={preferences.relative.format}
        />
      )}

      {preferences.absolute.show && (
        <AbsoluteColumn
          row={rowData}
          rowSpanTags={rowSpanTags}
          onHover={onHoverRange}
          format={preferences.absolute.format}
        />
      )}
      {preferences.showMultiplicity && (
        <td {...onHoverSignal}>
          {rowData.tableMetaInfo.signal?.multiplicity ?? 'm'}
        </td>
      )}

      {preferences.coupling.show && (
        <CouplingColumn
          row={rowData}
          onHover={onHoverSignal}
          format={preferences.coupling.format}
        />
      )}
      {preferences.showAssignment && (
        <>
          <SignalAssignmentsColumn
            row={rowData}
            assignment={assignmentSignal}
            highlight={highlightSignal}
            onHover={onHoverSignal}
            onLink={linkHandler}
            onUnlink={unlinkHandler}
          />

          <RangeAssignmentsColumn
            row={rowData}
            assignment={assignmentRange}
            highlight={highlightRangeAssignmentsColumn}
            onHover={onHoverRangeAssignmentsColumn}
            onLink={linkHandler}
            onUnlink={unlinkHandler}
            rowSpanTags={rowSpanTags}
            highlightData={highlightData}
          />
        </>
      )}
      <ActionsColumn
        row={rowData}
        onHoverSignal={onHoverSignal}
        onHoverRange={onHoverRange}
        rowSpanTags={rowSpanTags}
        showKind={preferences.showKind}
        showDeleteAction={preferences.showDeleteAction}
        showEditAction={preferences.showEditAction}
        showZoomAction={preferences.showZoomAction}
      />
    </ContextMenu>
  );
}

export default RangesTableRow;

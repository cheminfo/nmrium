/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { WorkSpacePanelPreferences } from 'nmr-load-save';
import { Info1D } from 'nmr-processing';
import { useMemo, useCallback, MouseEvent, CSSProperties } from 'react';

import {
  AssignmentsData,
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import { ContextMenu } from '../../elements/ContextMenuBluePrint';
import { TableContextMenuProps } from '../../elements/ReactTable/ReactTable';
import {
  HighlightEventSource,
  useHighlight,
  useHighlightData,
} from '../../highlight';

import AbsoluteColumn from './TableColumns/AbsoluteColumn';
import ActionsColumn from './TableColumns/ActionsColumn';
import CouplingColumn from './TableColumns/CouplingColumn';
import RangeAssignmentsColumn from './TableColumns/RangeAssignmentsColumn';
import RangeColumn from './TableColumns/RangeColumn';
import RelativeColumn from './TableColumns/RelativeColumn';
import SignalAssignmentsColumn from './TableColumns/SignalAssignmentsColumn';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn';
import SignalDeltaHzColumn from './TableColumns/SignalDeltaHzColumn';
import { RangeData } from './hooks/useMapRanges';

const HighlightedRowStyle = css`
  background-color: #ff6f0057;
`;

const ConstantlyHighlightedRowStyle = css`
  background-color: #f5f5dc;
`;

interface RangesTableRowProps extends TableContextMenuProps {
  rowData: any;
  onUnlink: (a: any, b?: any) => void;
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
  onUnlink,
  onContextMenuSelect,
  contextMenu = [],
  preferences,
  info,
}: RangesTableRowProps) {
  const assignmentData = useAssignmentData();
  const assignmentRange = useAssignment(rowData.id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned?.x || []).concat(
      filterForIDsWithAssignment(
        assignmentData,
        rowData.signals.map((_signal) => _signal.id),
      ),
    ),
    { type: HighlightEventSource.RANGE },
  );
  const highlightRangeAssignmentsColumn = useHighlight(
    assignmentRange.assigned?.x || [],
    { type: HighlightEventSource.RANGE },
  );
  const assignmentSignal = useAssignment(rowData?.tableMetaInfo?.id || '');

  const highlightSignal = useHighlight(
    assignmentSignal?.id
      ? [assignmentSignal.id].concat(assignmentSignal.assigned?.x || [])
      : [],
    { type: HighlightEventSource.SIGNAL },
  );
  const highlightData = useHighlightData();

  const rowSpanTags: any = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style: lodashGet(rowData.tableMetaInfo, 'hide', false)
        ? { display: 'none' }
        : undefined,
    };
  }, [rowData.tableMetaInfo]);

  const unlinkHandler = useCallback(
    (e: MouseEvent, isOnRangeLevel: boolean) => {
      // stop propagation here to prevent enabling/disabling the assignment mode at the same time
      if (e) {
        e.stopPropagation();
      }

      if (isOnRangeLevel !== undefined) {
        if (isOnRangeLevel) {
          onUnlink(rowData);
          assignmentRange.removeAll('x');
        } else {
          onUnlink(
            rowData,
            lodashGet(rowData, 'tableMetaInfo.signalIndex', undefined),
          );
          assignmentSignal.removeAll('x');
        }
      }
    },
    [assignmentRange, assignmentSignal, onUnlink, rowData],
  );

  const linkHandler = useCallback(
    (e: MouseEvent, assignment: AssignmentsData) => {
      e.stopPropagation();
      assignment.setActive('x');
    },
    [],
  );

  const onHoverRange = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.show('x');
        highlightRange.show();
      },
      onMouseLeave: () => {
        assignmentRange.hide();
        highlightRange.hide();
      },
    };
  }, [assignmentRange, highlightRange]);

  const onHoverRangeAssignmentsColumn = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.show('x');
        highlightRangeAssignmentsColumn.show();
      },
      onMouseLeave: () => {
        assignmentRange.hide();
        highlightRangeAssignmentsColumn.hide();
      },
    };
  }, [assignmentRange, highlightRangeAssignmentsColumn]);

  const onHoverSignal = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.show('x');
        highlightSignal.show();
      },
      onMouseLeave: () => {
        assignmentSignal.hide();
        highlightSignal.hide();
      },
    };
  }, [assignmentSignal, highlightSignal]);

  const trCss = useMemo(() => {
    return highlightRange.isActive || assignmentRange.isActive
      ? HighlightedRowStyle
      : lodashGet(rowData, 'tableMetaInfo.isConstantlyHighlighted', false)
        ? ConstantlyHighlightedRowStyle
        : null;
  }, [assignmentRange.isActive, highlightRange.isActive, rowData]);

  return (
    <ContextMenu
      options={contextMenu}
      onSelect={(selected) => onContextMenuSelect?.(selected, rowData)}
      as="tr"
      css={trCss}
    >
      {preferences.showSerialNumber && (
        <td {...rowSpanTags} {...onHoverRange}>
          {rowData.tableMetaInfo.rowIndex + 1}
        </td>
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
          {!rowData?.tableMetaInfo?.signal
            ? 'm'
            : lodashGet(rowData, 'tableMetaInfo.signal.multiplicity', '')}
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

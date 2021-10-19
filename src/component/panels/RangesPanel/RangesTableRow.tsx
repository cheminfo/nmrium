/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { useMemo, useCallback, useState } from 'react';

import {
  filterForIDsWithAssignment,
  useAssignment,
  useAssignmentData,
} from '../../assignment';
import {
  HighlightedSource,
  useHighlight,
  useHighlightData,
} from '../../highlight';
import { isColumnVisible } from '../extra/preferences/ColumnsHelper';

import AbsoluteColumn from './TableColumns/AbsoluteColumn';
import ActionsColumn from './TableColumns/ActionsColumn';
import CouplingColumn from './TableColumns/CouplingColumn';
import RangeAssignmentsColumn from './TableColumns/RangeAssignmentsColumn';
import RangeColumn from './TableColumns/RangeColumn';
import RelativeColumn from './TableColumns/RelativeColumn';
import SignalAssignmentsColumn from './TableColumns/SignalAssignmentsColumn';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn';
import useFormat from './TableColumns/format';

const HighlightedRowStyle = css`
  background-color: #ff6f0057;
`;

const ConstantlyHighlightedRowStyle = css`
  background-color: #f5f5dc;
`;

interface RangesTableRowProps {
  rowData: any;
  onUnlink: (a: any, b?: any) => void;
  onContextMenu: (element: any, data: any) => void;
  preferences: string;
}

function RangesTableRow({
  rowData,
  onUnlink,
  onContextMenu,
  preferences,
}: RangesTableRowProps) {
  const assignmentData = useAssignmentData();
  const assignmentRange = useAssignment(rowData.id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned.x || []).concat(
      filterForIDsWithAssignment(
        assignmentData,
        rowData.signals.map((_signal) => _signal.id),
      ),
    ),
    { type: HighlightedSource.RANGE },
  );
  const highlightRangeAssignmentsColumn = useHighlight(
    assignmentRange.assigned.x || [],
    { type: HighlightedSource.RANGE },
  );
  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignal = useHighlight(
    [assignmentSignal.id].concat(assignmentSignal.assigned.x || []),
    { type: HighlightedSource.SIGNAL },
  );
  const highlightData = useHighlightData();
  const [unlinkRangeButtonVisibility, showUnlinkRangeButton] = useState(false);
  const [unlinkSignalButtonVisibility, showUnlinkSignalButton] =
    useState(false);

  const getFormat = useFormat(preferences);

  const rowSpanTags: any = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style: lodashGet(rowData.tableMetaInfo, 'hide', false)
        ? { display: 'none' }
        : undefined,
    };
  }, [rowData.tableMetaInfo]);

  const unlinkHandler = useCallback(
    (e, isOnRangeLevel) => {
      // stop propagation here to prevent enabling/disabling the assignment mode at the same time
      if (e) {
        e.stopPropagation();
      }

      if (isOnRangeLevel !== undefined) {
        if (isOnRangeLevel) {
          onUnlink(rowData);
          showUnlinkRangeButton(false);
          assignmentRange.removeAll('x');
        } else {
          onUnlink(
            rowData,
            lodashGet(rowData, 'tableMetaInfo.signalIndex', undefined),
          );
          showUnlinkSignalButton(false);
          assignmentSignal.removeAll('x');
        }
      } else {
        showUnlinkRangeButton(false);
        showUnlinkSignalButton(false);
      }
    },
    [assignmentRange, assignmentSignal, onUnlink, rowData],
  );

  const linkHandler = useCallback((e, assignment) => {
    e.stopPropagation();
    assignment.onClick('x');
  }, []);

  const onHoverRange = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.onMouseEnter('x');
        highlightRange.show();
      },
      onMouseLeave: () => {
        assignmentRange.onMouseLeave('x');
        highlightRange.hide();
      },
    };
  }, [assignmentRange, highlightRange]);

  const onHoverRangeAssignmentsColumn = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.onMouseEnter('x');
        highlightRangeAssignmentsColumn.show();
      },
      onMouseLeave: () => {
        assignmentRange.onMouseLeave('x');
        highlightRangeAssignmentsColumn.hide();
      },
    };
  }, [assignmentRange, highlightRangeAssignmentsColumn]);

  const onHoverSignal = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('x');
        highlightSignal.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('x');
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
    <tr onContextMenu={(e) => onContextMenu(e, rowData)} css={trCss}>
      <td {...rowSpanTags} {...onHoverRange}>
        {rowData.tableMetaInfo.rowIndex + 1}
      </td>

      {isColumnVisible(preferences, 'showFrom') && (
        <RangeColumn
          value={rowData.from}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('showFrom', undefined)}
        />
      )}
      {isColumnVisible(preferences, 'showTo') && (
        <RangeColumn
          value={rowData.to}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('toFormat', undefined)}
        />
      )}

      <SignalDeltaColumn
        rowData={rowData}
        onHoverSignal={onHoverSignal}
        preferences={preferences}
      />

      {isColumnVisible(preferences, 'showRelative') && (
        <RelativeColumn
          rowData={rowData}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('relativeFormat', undefined)}
        />
      )}

      {isColumnVisible(preferences, 'showAbsolute') && (
        <AbsoluteColumn
          value={rowData.absolute}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('absoluteFormat', undefined)}
        />
      )}

      <td {...onHoverSignal}>
        {lodashGet(rowData, 'tableMetaInfo.signal.multiplicity', '')}
      </td>

      <CouplingColumn rowData={rowData} onHoverSignal={onHoverSignal} />

      <SignalAssignmentsColumn
        rowData={rowData}
        assignment={assignmentSignal}
        highlight={highlightSignal}
        onHover={onHoverSignal}
        unlinkVisibility={unlinkSignalButtonVisibility}
        onUnlinkVisibilityChange={(flag) => showUnlinkSignalButton(flag)}
        onLink={linkHandler}
        onUnlink={unlinkHandler}
      />

      <RangeAssignmentsColumn
        rowData={rowData}
        assignment={assignmentRange}
        highlight={highlightRangeAssignmentsColumn}
        onHover={onHoverRangeAssignmentsColumn}
        unlinkVisibility={unlinkRangeButtonVisibility}
        onUnlinkVisibilityChange={(flag) => showUnlinkRangeButton(flag)}
        onLink={linkHandler}
        onUnlink={unlinkHandler}
        rowSpanTags={rowSpanTags}
        highlightData={highlightData}
      />

      <ActionsColumn
        rowData={rowData}
        onHoverSignal={onHoverSignal}
        onHoverRange={onHoverRange}
        rowSpanTags={rowSpanTags}
      />
    </tr>
  );
}

export default RangesTableRow;

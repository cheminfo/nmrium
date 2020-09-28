/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { useMemo, useCallback, useState } from 'react';

import { useAssignment } from '../../assignment';
import { useHighlight, useHighlightData } from '../../highlight';
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

const RangesTableRow = ({ rowData, onUnlink, onContextMenu, preferences }) => {
  const assignmentRange = useAssignment(rowData.id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned.x || []),
  );
  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignal = useHighlight(
    [assignmentSignal.id].concat(assignmentSignal.assigned.x || []),
  );
  const highlightData = useHighlightData();

  const [unlinkRangeButtonVisibility, showUnlinkRangeButton] = useState(false);
  const [unlinkSignalButtonVisibility, showUnlinkSignalButton] = useState(
    false,
  );

  const getFormat = useFormat(preferences);

  const rowSpanTags = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style: lodash.get(rowData.tableMetaInfo, 'hide', false)
        ? { display: 'none' }
        : null,
    };
  }, [rowData.tableMetaInfo]);

  const unlinkHandler = useCallback(
    (e, isOnRangeLevel) => {
      // stop propagation here to prevent enabling/disabling the assignment mode at the same time
      if (e) {
        e.stopPropagation();
      }

      onUnlink(
        rowData,
        isOnRangeLevel,
        lodash.get(rowData, 'tableMetaInfo.signalIndex', undefined),
      );
      if (isOnRangeLevel !== undefined) {
        if (isOnRangeLevel) {
          showUnlinkRangeButton(false);
          assignmentRange.removeAll('x');
        } else {
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
    assignment.onClick(e, 'x');
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
      : lodash.get(rowData, 'tableMetaInfo.isConstantlyHighlighted', false)
      ? ConstantlyHighlightedRowStyle
      : null;
  }, [assignmentRange.isActive, highlightRange.isActive, rowData]);

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, rowData)}
      css={trCss}
      {...highlightRange.onHover}
    >
      <td {...rowSpanTags} {...onHoverRange}>
        {rowData.tableMetaInfo.rowIndex + 1}
      </td>

      {isColumnVisible(preferences, 'showFrom') && (
        <RangeColumn
          value={rowData.from}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('showFrom')}
        />
      )}
      {isColumnVisible(preferences, 'showTo') && (
        <RangeColumn
          value={rowData.to}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('toFormat')}
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
          format={getFormat('relativeFormat')}
        />
      )}

      {isColumnVisible(preferences, 'showAbsolute') && (
        <AbsoluteColumn
          value={rowData.absolute}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={getFormat('absoluteFormat')}
        />
      )}

      <td {...onHoverSignal}>
        {lodash.get(rowData, 'tableMetaInfo.signal.multiplicity', '')}
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
        highlight={highlightRange}
        onHover={onHoverRange}
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
};

export default RangesTableRow;

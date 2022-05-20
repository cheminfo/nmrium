/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { useMemo, useCallback, useState } from 'react';

import { Info1D } from '../../../data/types/data1d';
import {
  AssignmentsData,
  useAssignment,
  useAssignmentData,
} from '../../assignment/AssignmentsContext';
import { filterForIDsWithAssignment } from '../../assignment/utilities/filterForIDsWithAssignment';
import {
  HighlightedSource,
  useHighlight,
  useHighlightData,
} from '../../highlight';
import { WorkSpacePanelPreferences } from '../../workspaces/Workspace';

import AbsoluteColumn from './TableColumns/AbsoluteColumn';
import ActionsColumn from './TableColumns/ActionsColumn';
import CouplingColumn from './TableColumns/CouplingColumn';
import RangeAssignmentsColumn from './TableColumns/RangeAssignmentsColumn';
import RangeColumn from './TableColumns/RangeColumn';
import RelativeColumn from './TableColumns/RelativeColumn';
import SignalAssignmentsColumn from './TableColumns/SignalAssignmentsColumn';
import SignalDeltaColumn from './TableColumns/SignalDeltaColumn';
import SignalDeltaHzColumn from './TableColumns/SignalDeltaHzColumn';
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
  preferences: WorkSpacePanelPreferences['ranges'];
  info: Info1D;
}

function RangesTableRow({
  rowData,
  onUnlink,
  onContextMenu,
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
    { type: HighlightedSource.RANGE },
  );
  const highlightRangeAssignmentsColumn = useHighlight(
    assignmentRange.assigned?.x || [],
    { type: HighlightedSource.RANGE },
  );
  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignal = useHighlight(
    [assignmentSignal.id].concat(assignmentSignal.assigned?.x || []),
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

  const linkHandler = useCallback((e, assignment: AssignmentsData) => {
    e.stopPropagation();
    assignment.setActive('x');
  }, []);

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
    <tr onContextMenu={(e) => onContextMenu(e, rowData)} css={trCss}>
      <td {...rowSpanTags} {...onHoverRange}>
        {rowData.tableMetaInfo.rowIndex + 1}
      </td>

      {preferences.from.show && (
        <RangeColumn
          value={rowData.from}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={preferences.from.format}
        />
      )}
      {preferences.to.show && (
        <RangeColumn
          value={rowData.to}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={preferences.to.format}
        />
      )}

      {preferences.deltaPPM.show && (
        <SignalDeltaColumn
          rowData={rowData}
          onHoverSignal={onHoverSignal}
          deltaPPMFormat={preferences.deltaPPM.format}
        />
      )}
      {preferences.deltaHz.show && (
        <SignalDeltaHzColumn
          rowData={rowData}
          onHoverSignal={onHoverSignal}
          deltaHzFormat={preferences.deltaHz.format}
          info={info}
        />
      )}

      {preferences.relative.show && (
        <RelativeColumn
          rowData={rowData}
          rowSpanTags={rowSpanTags}
          onHoverRange={onHoverRange}
          format={preferences.relative.format}
        />
      )}

      {preferences.absolute.show && (
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

      {preferences.coupling.show && (
        <CouplingColumn
          rowData={rowData}
          onHoverSignal={onHoverSignal}
          format={preferences.coupling.format}
        />
      )}

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
        showKind={preferences.showKind}
      />
    </tr>
  );
}

export default RangesTableRow;

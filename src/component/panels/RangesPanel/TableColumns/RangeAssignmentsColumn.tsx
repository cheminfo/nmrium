/** @jsxImportSource @emotion/react */

import type { CSSProperties } from 'react';
import { memo } from 'react';

import type { AssignmentsData } from '../../../assignment/AssignmentsContext.js';
import {
  removeAssignmentCssStyle,
  RemoveAssignmentsButton,
} from '../../../elements/RemoveAssignmentsButton.js';
import { HighlightEventSource } from '../../../highlight/index.js';
import type { RangeColumnProps } from '../RangesTableRow.js';

const columnStyle: CSSProperties = {
  padding: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
};

function getStyle(flag: boolean, isCompletelyAssigned: boolean) {
  if (flag) {
    return {
      color: 'red',
      fontWeight: 'bold',
    };
  } else if (isCompletelyAssigned) {
    return { color: 'green', fontWeight: 'bold' };
  } else {
    return { color: 'black', fontWeight: 'normal' };
  }
}
interface RemoveAssignmentsButtonProps {
  onUnlink?: (element: any, b: boolean) => void;
}
interface RangAssignmentColumnProps
  extends Omit<RangeColumnProps, 'format'>,
    RemoveAssignmentsButtonProps {
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onLink?: (a: any, b: any) => void;
  highlightData: any;
}

function RangeAssignmentsColumn({
  row,
  assignment,
  highlight,
  onLink,
  onUnlink,
  rowSpanTags,
  onHover,
  highlightData,
}: RangAssignmentColumnProps) {
  const diaIDs = row.diaIDs || [];

  const flag =
    assignment.isActive ||
    assignment.isOver ||
    (highlight.isActive &&
      highlightData.highlight.sourceData?.type !== HighlightEventSource.SIGNAL);

  const isCompletelyAssigned = Math.round(row.integration) === row?.nbAtoms;

  let totalNumberOfAtoms = row?.nbAtoms || 0;
  for (const signal of row?.signals || []) {
    totalNumberOfAtoms += signal?.nbAtoms || 0;
  }

  return (
    <td
      {...rowSpanTags}
      style={{
        ...columnStyle,
        ...rowSpanTags.style,
      }}
      {...onHover}
      {...{ onClick: (e) => onLink?.(e, assignment) }}
      css={!assignment.isActive && removeAssignmentCssStyle}
    >
      {(totalNumberOfAtoms > 0 || assignment.isActive) && (
        <>
          {totalNumberOfAtoms} {' ( '}
          <span style={getStyle(flag, isCompletelyAssigned)}>
            {diaIDs?.length || 0}
          </span>
          {' ) '}
          <RemoveAssignmentsButton onClick={(e) => onUnlink?.(e, true)} />
        </>
      )}
    </td>
  );
}

export default memo(RangeAssignmentsColumn);

/** @jsxImportSource @emotion/react */

import { CSSProperties, useMemo, memo } from 'react';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';
import { HighlightEventSource } from '../../../highlight';
import { AssignmentColumnCssStyle, RangeColumnProps } from '../RangesTableRow';

import { RemoveAssignmentsButton } from './RemoveAssignmentsButton';

const spanStyle: CSSProperties = {
  color: 'red',
  fontWeight: 'bold',
};

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

  const spanCss: CSSProperties = useMemo(() => {
    const flag =
      assignment.isActive ||
      assignment.isOver ||
      (highlight.isActive &&
        highlightData.highlight.sourceData?.type !==
          HighlightEventSource.SIGNAL);
    return flag
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : { color: 'black', fontWeight: 'normal' };
  }, [
    assignment.isActive,
    assignment.isOver,
    highlight.isActive,
    highlightData.highlight.sourceData?.type,
  ]);

  let totalNumberOfAtoms = row?.nbAtoms || 0;
  for (const signal of row?.signals || []) {
    totalNumberOfAtoms += signal?.nbAtoms || 0;
  }

  return (
    <td
      {...rowSpanTags}
      style={{
        padding: 0,
        ...rowSpanTags.style,
        textAlign: 'center',
        verticalAlign: 'middle',
      }}
      {...onHover}
      {...{ onClick: (e) => onLink?.(e, assignment) }}
      css={!assignment.isActive && AssignmentColumnCssStyle}
    >
      {(totalNumberOfAtoms > 0 || assignment.isActive) && (
        <>
          {totalNumberOfAtoms} {' ( '}
          <span style={assignment.isActive ? spanStyle : spanCss}>
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

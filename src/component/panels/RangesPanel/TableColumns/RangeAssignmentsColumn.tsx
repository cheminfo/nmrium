import lodashGet from 'lodash/get';
import { CSSProperties, useMemo, useCallback, memo } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';
import { HighlightEventSource } from '../../../highlight';
import { RangeColumnProps } from '../RangesTableRow';

const spanStyle: CSSProperties = {
  color: 'red',
  fontWeight: 'bold',
};

interface RangAssignmentColumnProps extends Omit<RangeColumnProps, 'format'> {
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onUnlinkVisibilityChange?: (element: any) => void;
  unlinkVisibility: boolean;
  onLink?: (a: any, b: any) => void;
  onUnlink?: (element: any, b: boolean) => void;
  highlightData: any;
}

function RangeAssignmentsColumn({
  row,
  assignment,
  highlight,
  onUnlinkVisibilityChange,
  unlinkVisibility,
  onLink,
  onUnlink,
  rowSpanTags,
  onHover,
  highlightData,
}: RangAssignmentColumnProps) {
  const diaIDs = lodashGet(row, 'diaIDs', []);

  const visibilityChangeHandler = useCallback(
    (flag) => {
      onUnlinkVisibilityChange?.(flag);
    },
    [onUnlinkVisibilityChange],
  );

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

  return (
    <td
      {...rowSpanTags}
      style={{ padding: '0', ...rowSpanTags.style }}
      {...onHover}
      {...{ onClick: (e) => onLink?.(e, assignment) }}
    >
      {row.nbAtoms !== undefined && row.nbAtoms > 0 ? (
        row.diaIDs && row.diaIDs.length > 0 ? (
          <div
            onMouseEnter={() => visibilityChangeHandler(true)}
            onMouseLeave={() => visibilityChangeHandler(false)}
          >
            {row.nbAtoms} {' ( '}
            <span style={spanCss}>{diaIDs.length}</span>
            {' ) '}
            <sup>
              <button
                type="button"
                style={{
                  visibility: unlinkVisibility ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => onUnlink?.(e, true)}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : assignment.isActive ? (
          <div>
            {`${row.nbAtoms} (`}
            <span style={spanStyle}>0</span>
            {')'}
          </div>
        ) : (
          row.nbAtoms
        )
      ) : assignment.isActive ? (
        <div>
          {'0 ('}
          <span style={spanStyle}>0</span>
          {')'}
        </div>
      ) : (
        ''
      )}
    </td>
  );
}

export default memo(RangeAssignmentsColumn);

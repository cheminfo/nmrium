import lodashGet from 'lodash/get';
import { CSSProperties, useMemo, useCallback, memo } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';
import { HighlightedSource } from '../../../highlight';

const spanStyle: CSSProperties = {
  color: 'red',
  fontWeight: 'bold',
};

interface RangAssignmentColumnProps {
  rowData: any;
  onHover: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onUnlinkVisibilityChange?: (element: any) => void;
  unlinkVisibility: boolean;
  onLink?: (a: any, b: any) => void;
  onUnlink?: (element: any, b: boolean) => void;
  rowSpanTags: any;
  highlightData: any;
}

function RangeAssignmentsColumn({
  rowData,
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
  const diaIDs = useMemo(() => {
    return lodashGet(rowData, 'diaIDs', 0);
  }, [rowData]);

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
        highlightData.highlight.sourceData?.type !== HighlightedSource.SIGNAL);
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
      {...onHover}
      {...{ onClick: (e) => onLink?.(e, assignment) }}
    >
      {rowData.nbAtoms !== undefined && rowData.nbAtoms > 0 ? (
        rowData.diaIDs && rowData.diaIDs.length > 0 ? (
          <div
            onMouseEnter={() => visibilityChangeHandler(true)}
            onMouseLeave={() => visibilityChangeHandler(false)}
          >
            {rowData.nbAtoms} {' ( '}
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
            {`${rowData.nbAtoms} (`}
            <span style={spanStyle}>0</span>
            {')'}
          </div>
        ) : (
          rowData.nbAtoms
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

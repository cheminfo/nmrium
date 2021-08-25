import lodashGet from 'lodash/get';
import { CSSProperties, useMemo, useCallback, memo } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { TYPES } from '../../../highlight';

const spanStyle: CSSProperties = {
  color: 'red',
  fontWeight: 'bold',
};

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
}) {
  const diaIDs = useMemo(() => {
    return lodashGet(rowData, 'diaIDs', []);
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
      assignment.isOnHover ||
      (highlight.isActive && highlightData.highlight.type !== TYPES.SIGNAL);
    return flag
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : { color: 'black', fontWeight: 'normal' };
  }, [
    assignment.isActive,
    assignment.isOnHover,
    highlight.isActive,
    highlightData.highlight.type,
  ]);

  return (
    <td
      {...rowSpanTags}
      {...onHover}
      {...{ onClick: (e) => onLink?.(e, assignment) }}
    >
      {rowData.pubIntegral !== undefined && rowData.pubIntegral > 0 ? (
        rowData.diaIDs && rowData.diaIDs.length > 0 ? (
          <div
            onMouseEnter={() => visibilityChangeHandler(true)}
            onMouseLeave={() => visibilityChangeHandler(false)}
          >
            {rowData.pubIntegral} {' ( '}
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
            {`${rowData.pubIntegral} (`}
            <span style={spanStyle}>0</span>
            {')'}
          </div>
        ) : (
          rowData.pubIntegral
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

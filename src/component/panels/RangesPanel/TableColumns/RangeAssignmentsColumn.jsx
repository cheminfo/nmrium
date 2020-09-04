import lodash from 'lodash';
import React, { useMemo, useCallback, memo } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { HighlightSignalConcatenation } from '../../extra/constants/ConcatenationStrings';

const spanStyle = {
  color: 'red',
  fontWeight: 'bold',
};

const RangeAssignmentsColumn = memo(
  ({
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
  }) => {
    const diaIDs = useMemo(() => {
      return lodash.get(rowData, 'diaID', []);
    }, [rowData]);

    const visibilityChangeHandler = useCallback(
      (flag) => {
        onUnlinkVisibilityChange(flag);
      },
      [onUnlinkVisibilityChange],
    );

    const spanCss = useMemo(() => {
      const flag =
        assignment.isActive ||
        assignment.isOnHover ||
        (highlight.isActive &&
          !highlightData.highlight.highlighted.find((_highlighted) => {
            const split = _highlighted.split(HighlightSignalConcatenation);
            return split[0] === assignment.id && split.length > 1;
          }));

      return flag
        ? {
            color: 'red',
            fontWeight: 'bold',
          }
        : { color: 'black', fontWeight: 'normal' };
    }, [
      assignment.id,
      assignment.isActive,
      assignment.isOnHover,
      highlight.isActive,
      highlightData.highlight.highlighted,
    ]);

    return (
      <td
        {...rowSpanTags}
        {...onHover}
        {...{ onClick: (e) => onLink(e, assignment) }}
      >
        {rowData.pubIntegral !== undefined && rowData.pubIntegral > 0 ? (
          rowData.diaID && rowData.diaID.length > 0 ? (
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
                  onClick={(e) => onUnlink(e, true)}
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
  },
);

RangeAssignmentsColumn.defaultProps = {
  onHover: () => null,
  onUnlinkVisibilityChange: () => null,
  onLink: () => null,
  onUnlink: () => null,
};

export default RangeAssignmentsColumn;

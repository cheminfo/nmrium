import lodashGet from 'lodash/get';
import { CSSProperties, memo, MouseEvent } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';
import { OnHoverEvent, BaseRangeColumnProps } from '../RangesTableRow';

interface SignalAssignmentsColumnProps
  extends Omit<BaseRangeColumnProps, 'format'>,
    OnHoverEvent {
  assignment: AssignmentsData;
  highlight: {
    isActive: boolean;
  };
  onUnlinkVisibilityChange?: (element: any) => void;
  unlinkVisibility: boolean;
  onLink?: (a: MouseEvent, b: AssignmentsData) => void;
  onUnlink?: (element: MouseEvent, b: boolean) => void;
}

function SignalAssignmentsColumn({
  row,
  onHover,
  assignment,
  highlight,
  onUnlinkVisibilityChange,
  unlinkVisibility,
  onLink,
  onUnlink,
}: SignalAssignmentsColumnProps) {
  const diaIDs = lodashGet(row, 'tableMetaInfo.signal.diaIDs', []);

  const tdCss: CSSProperties =
    assignment.isActive || highlight.isActive
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : {};

  function visibilityChangeHandler(flag: boolean) {
    onUnlinkVisibilityChange?.(flag);
  }

  function assignHandler(e: MouseEvent) {
    onLink?.(e, assignment);
  }

  return (
    <td {...onHover} onClick={assignHandler} style={{ padding: '0', ...tdCss }}>
      {diaIDs && diaIDs.length > 0 ? (
        <div
          onMouseEnter={() => visibilityChangeHandler(true)}
          onMouseLeave={() => visibilityChangeHandler(false)}
        >
          <span>{diaIDs.length}</span>
          <sup>
            <button
              type="button"
              style={{
                visibility: unlinkVisibility ? 'visible' : 'hidden',
                padding: 0,
                margin: 0,
              }}
              onClick={(e) => onUnlink?.(e, false)}
            >
              <FaMinusCircle color="red" />
            </button>
          </sup>
        </div>
      ) : assignment.isActive ? (
        '0'
      ) : (
        ''
      )}
    </td>
  );
}

export default memo(SignalAssignmentsColumn);

import lodashGet from 'lodash/get';
import { CSSProperties, useMemo, useCallback, memo, MouseEvent } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData } from '../../../assignment/AssignmentsContext';

interface SignalAssignmentsColumnProps {
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
  onLink?: (a: MouseEvent, b: AssignmentsData) => void;
  onUnlink?: (element: MouseEvent, b: boolean) => void;
}

function SignalAssignmentsColumn({
  rowData,
  onHover,
  assignment,
  highlight,
  onUnlinkVisibilityChange,
  unlinkVisibility,
  onLink,
  onUnlink,
}: SignalAssignmentsColumnProps) {
  const diaIDs = useMemo(() => {
    return lodashGet(rowData, 'tableMetaInfo.signal.diaIDs', []);
  }, [rowData]);

  const tdCss: CSSProperties | undefined = useMemo(() => {
    return assignment.isActive || highlight.isActive
      ? {
          color: 'red',
          fontWeight: 'bold',
        }
      : undefined;
  }, [assignment.isActive, highlight.isActive]);

  const visibilityChangeHandler = useCallback(
    (flag: boolean) => {
      onUnlinkVisibilityChange?.(flag);
    },
    [onUnlinkVisibilityChange],
  );
  const assignHandler = useCallback(
    (e: MouseEvent) => {
      onLink?.(e, assignment);
    },
    [assignment, onLink],
  );

  return (
    <td {...onHover} onClick={assignHandler} style={tdCss}>
      {diaIDs && diaIDs.length > 0 ? (
        <div
          onMouseEnter={() => visibilityChangeHandler(true)}
          onMouseLeave={() => visibilityChangeHandler(false)}
        >
          {diaIDs.length}{' '}
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

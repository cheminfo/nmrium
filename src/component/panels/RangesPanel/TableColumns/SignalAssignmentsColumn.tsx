import lodashGet from 'lodash/get';
import { CSSProperties, useMemo, useCallback, memo } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

interface SignalAssignmentsColumnProps {
  rowData: any;
  onHover: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  assignment: {
    isActive: boolean;
  };
  highlight: {
    isActive: boolean;
  };
  onUnlinkVisibilityChange?: (element: any) => void;
  unlinkVisibility: boolean;
  onLink?: (a: any, b: any) => void;
  onUnlink?: (element: any, b: boolean) => void;
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
    (flag) => {
      onUnlinkVisibilityChange?.(flag);
    },
    [onUnlinkVisibilityChange],
  );
  const assignHandler = useCallback(
    (e) => {
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

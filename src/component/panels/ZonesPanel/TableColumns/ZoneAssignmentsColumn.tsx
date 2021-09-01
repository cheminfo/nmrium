import lodashGet from 'lodash/get';
import { FaMinusCircle } from 'react-icons/fa';

import { RowDataProps } from './ActionsColumn';

export interface ZoneAssignmentColumnProps {
  rowData: RowDataProps;
  axis: any;
  onHover: () => void;
  onClick: (a: any, b: any, c: any) => void;
  onUnlink: (a: any, b: any, c: any) => void;
  highlight: {
    isActive: any;
  };
  assignment: {
    activeAxis: any;
    onHoverAxis: any;
    isActive: boolean;
    isOnHover: boolean;
  };
  showUnlinkButton: boolean;
  setShowUnlinkButton: (element: boolean) => void;
  rowSpanTags: any;
}

function ZoneAssignmentColumn({
  rowData,
  assignment,
  highlight,
  onHover,
  onClick,
  onUnlink,
  axis,
  showUnlinkButton,
  setShowUnlinkButton,
  rowSpanTags,
}: ZoneAssignmentColumnProps) {
  return (
    <td
      {...rowSpanTags}
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
    >
      {lodashGet(rowData, `${axis}.pubIntegral`, 0) > 0 ? (
        lodashGet(rowData, `${axis}.diaIDs`, 0).length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButton(true)}
            onMouseLeave={() => setShowUnlinkButton(false)}
          >
            {rowData[axis].pubIntegral} {`(`}
            <span
              style={
                (assignment.isActive && assignment.activeAxis === axis) ||
                (assignment.isOnHover && assignment.onHoverAxis === axis) ||
                highlight.isActive
                  ? {
                      color: 'red',
                      fontWeight: 'bold',
                    }
                  : { color: 'black', fontWeight: 'normal' }
              }
            >
              {lodashGet(rowData, `${axis}.nbAtoms`, 0)}
            </span>
            {`)`}{' '}
            <sup>
              <button
                type="button"
                style={{
                  visibility: showUnlinkButton ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => onUnlink(e, true, axis)}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : assignment.isActive && assignment.activeAxis === axis ? (
          <div>
            {`${lodashGet(rowData, `${axis}.pubIntegral`, '')} (`}
            <span
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              0
            </span>
            {')'}
          </div>
        ) : (
          rowData[axis].pubIntegral
        )
      ) : assignment.isActive && assignment.activeAxis === axis ? (
        <div>
          {'0 ('}
          <span style={{ color: 'red', fontWeight: 'bold' }}>0</span>
          {')'}
        </div>
      ) : (
        ''
      )}
    </td>
  );
}

export default ZoneAssignmentColumn;

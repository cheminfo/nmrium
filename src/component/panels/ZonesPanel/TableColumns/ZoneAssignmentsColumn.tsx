import lodashGet from 'lodash/get';
import { MouseEvent } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';

import { RowDataProps } from './ActionsColumn';

export interface ZoneAssignmentColumnProps {
  rowData: RowDataProps;
  axis: any;
  onHover: () => void;
  onClick: (event: MouseEvent, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: MouseEvent, flag: boolean, axis: Axis) => void;
  highlight: {
    isActive: any;
  };

  assignment: AssignmentsData;
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
      {lodashGet(rowData, `${axis}.nbAtoms`, 0) > 0 ? (
        lodashGet(rowData, `${axis}.diaIDs`, []).length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButton(true)}
            onMouseLeave={() => setShowUnlinkButton(false)}
          >
            {rowData[axis].nbAtoms} {`(`}
            <span
              style={
                (assignment.isActive && assignment.activated?.axis === axis) ||
                (assignment.isOver && assignment.highlighted?.axis === axis) ||
                highlight.isActive
                  ? {
                      color: 'red',
                      fontWeight: 'bold',
                    }
                  : { color: 'black', fontWeight: 'normal' }
              }
            >
              {lodashGet(rowData, `${axis}.diaIDs`, []).length}
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
        ) : assignment.isActive && assignment.activated?.axis === axis ? (
          <div>
            {`${lodashGet(rowData, `${axis}.nbAtoms`, '')} (`}
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
          rowData[axis].nbAtoms
        )
      ) : assignment.isActive && assignment.activated?.axis === axis ? (
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

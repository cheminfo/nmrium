import lodashGet from 'lodash/get';
import { FaMinusCircle } from 'react-icons/fa';

import { AssignmentsData, Axis } from '../../../assignment/AssignmentsContext';

import { RowDataProps } from './ActionsColumn';

export interface SignalAssignmentsColumnProps {
  rowData: RowDataProps;
  assignment: AssignmentsData;
  // assignment: {
  //   isActive: any;
  //   activeAxis: any;
  // };
  highlight: {
    isActive: any;
  };
  onHover: () => void;
  onClick: (event: any, assignment: AssignmentsData, axis: Axis) => void;
  onUnlink: (event: any, flag: boolean, axis: Axis) => void;
  showUnlinkButton: boolean;
  axis: Axis;
  setShowUnlinkButton: (element: boolean) => void;
}

function SignalAssignmentsColumn({
  rowData,
  assignment,
  highlight,
  onHover,
  onClick,
  onUnlink,
  axis,
  showUnlinkButton,
  setShowUnlinkButton,
}: SignalAssignmentsColumnProps) {
  return (
    <td
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      style={
        highlight.isActive ||
        (assignment.isActive && assignment.activated?.axis === axis)
          ? {
              color: 'red',
              fontWeight: 'bold',
            }
          : undefined
      }
    >
      {lodashGet(rowData, `tableMetaInfo.signal.${axis}.diaIDs`, []).length >
      0 ? (
        <div
          onMouseEnter={() => setShowUnlinkButton(true)}
          onMouseLeave={() => setShowUnlinkButton(false)}
        >
          {rowData.tableMetaInfo.signal[axis].diaIDs.length}{' '}
          <sup>
            <button
              type="button"
              style={{
                visibility: showUnlinkButton ? 'visible' : 'hidden',
                padding: 0,
                margin: 0,
              }}
              onClick={(e) => onUnlink(e, false, axis)}
            >
              <FaMinusCircle color="red" />
            </button>
          </sup>
        </div>
      ) : assignment.isActive && assignment.activated?.axis === axis ? (
        '0'
      ) : (
        ''
      )}
    </td>
  );
}

export default SignalAssignmentsColumn;

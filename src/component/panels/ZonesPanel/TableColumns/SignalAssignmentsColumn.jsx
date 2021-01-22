import lodash from 'lodash';
import { FaMinusCircle } from 'react-icons/fa';

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
}) {
  return (
    <td
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
      style={
        highlight.isActive ||
        (assignment.isActive && assignment.activeAxis === axis)
          ? {
              color: 'red',
              fontWeight: 'bold',
            }
          : null
      }
    >
      {lodash.get(rowData, `tableMetaInfo.signal.${axis}.diaID`, []).length >
      0 ? (
        <div
          onMouseEnter={() => setShowUnlinkButton(true)}
          onMouseLeave={() => setShowUnlinkButton(false)}
        >
          {rowData.tableMetaInfo.signal[axis].diaID.length}{' '}
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
      ) : assignment.isActive && assignment.activeAxis === axis ? (
        '0'
      ) : (
        ''
      )}
    </td>
  );
}

export default SignalAssignmentsColumn;

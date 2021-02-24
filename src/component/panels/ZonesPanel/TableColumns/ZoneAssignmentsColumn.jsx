import lodashGet from 'lodash/get';
import { FaMinusCircle } from 'react-icons/fa';

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
}) {
  return (
    <td
      {...rowSpanTags}
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
    >
      {lodashGet(rowData, `${axis}.pubIntegral`, 0) > 0 ? (
        lodashGet(rowData, `${axis}.diaID`, []).length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButton(true)}
            onMouseLeave={() => setShowUnlinkButton(false)}
          >
            {rowData[axis].pubIntegral} {`(`}
            <span
              style={
                assignment.isActive & (assignment.activeAxis === axis) ||
                assignment.isOnHover & (assignment.onHoverAxis === axis) ||
                highlight.isActive
                  ? {
                      color: 'red',
                      fontWeight: 'bold',
                    }
                  : { color: 'black', fontWeight: 'normal' }
              }
            >
              {lodashGet(rowData, `${axis}.diaID`, []).length}
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

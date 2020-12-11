import lodash from 'lodash';
import { FaMinusCircle } from 'react-icons/fa';

const ZoneAssignmentColumn = ({
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
}) => {
  return (
    <td
      {...rowSpanTags}
      {...onHover}
      {...{ onClick: (e) => onClick(e, assignment, axis) }}
    >
      {lodash.get(rowData, `${axis}.pubIntegral`, 0) > 0 ? (
        lodash.get(rowData, `${axis}.diaID`, []).length > 0 ? (
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
              {lodash.get(rowData, `${axis}.diaID`, []).length}
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
            {`${lodash.get(rowData, `${axis}.pubIntegral`, '')} (`}
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
          rowData.x.pubIntegral
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
};

export default ZoneAssignmentColumn;

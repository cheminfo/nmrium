import lodash from 'lodash';
import React, { Fragment } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

const SignalAssignmentsColumn = ({
  rowData,
  assignmentSignal,
  onHoverSignalX,
  onHoverSignalY,
  showUnlinkButtonSignalX,
  showUnlinkButtonSignalY,
  setShowUnlinkButtonSignalX,
  setShowUnlinkButtonSignalY,
  onClick,
  onUnlink,
  highlightSignalX,
  highlightSignalY,
}) => {
  return (
    <Fragment>
      <td
        {...onHoverSignalX}
        {...{ onClick: (e) => onClick(e, assignmentSignal, 'x') }}
        style={
          highlightSignalX.isActive ||
          (assignmentSignal.isActive && assignmentSignal.activeAxis === 'x')
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {lodash.get(rowData, 'tableMetaInfo.signal.x.diaID', []).length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButtonSignalX(true)}
            onMouseLeave={() => setShowUnlinkButtonSignalX(false)}
          >
            {rowData.tableMetaInfo.signal.x.diaID.length}{' '}
            <sup>
              <button
                type="button"
                style={{
                  visibility: showUnlinkButtonSignalX ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => onUnlink(e, false, 'x')}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : assignmentSignal.isActive && assignmentSignal.activeAxis === 'x' ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td
        {...onHoverSignalY}
        {...{ onClick: (e) => onClick(e, assignmentSignal, 'y') }}
        style={
          highlightSignalY.isActive ||
          (assignmentSignal.isActive && assignmentSignal.activeAxis === 'y')
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {lodash.get(rowData, 'tableMetaInfo.signal.y.diaID', []).length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButtonSignalY(true)}
            onMouseLeave={() => setShowUnlinkButtonSignalY(false)}
          >
            {rowData.tableMetaInfo.signal.y.diaID.length}{' '}
            <sup>
              <button
                type="button"
                style={{
                  visibility: showUnlinkButtonSignalY ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => onUnlink(e, false, 'y')}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : assignmentSignal.isActive && assignmentSignal.activeAxis === 'y' ? (
          '0'
        ) : (
          ''
        )}
      </td>
    </Fragment>
  );
};

export default SignalAssignmentsColumn;

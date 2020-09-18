import lodash from 'lodash';
import React, { Fragment } from 'react';
import { FaMinusCircle } from 'react-icons/fa';

const ZoneAssignmentsColumn = ({
  rowData,
  assignmentZone,
  onHoverZoneX,
  onHoverZoneY,
  showUnlinkButtonZoneX,
  showUnlinkButtonZoneY,
  setShowUnlinkButtonZoneX,
  setShowUnlinkButtonZoneY,
  rowSpanTags,
  onClick,
  onUnlink,
  highlightZoneX,
  highlightZoneY,
}) => {
  return (
    <Fragment>
      <td
        {...rowSpanTags}
        {...onHoverZoneX}
        {...{ onClick: (e) => onClick(e, assignmentZone, 'x') }}
      >
        {lodash.get(rowData, 'x.pubIntegral', 0) > 0 ? (
          lodash.get(rowData, 'x.diaID', []).length > 0 ? (
            <div
              onMouseEnter={() => setShowUnlinkButtonZoneX(true)}
              onMouseLeave={() => setShowUnlinkButtonZoneX(false)}
            >
              {`${rowData.x.pubIntegral}`} {`(`}
              <span
                style={
                  (assignmentZone.isActive &&
                    assignmentZone.activeAxis === 'x') ||
                  (assignmentZone.isOnHover &&
                    assignmentZone.onHoverAxis === 'x') ||
                  highlightZoneX.isActive
                    ? {
                        color: 'red',
                        fontWeight: 'bold',
                      }
                    : { color: 'black', fontWeight: 'normal' }
                }
              >
                {rowData.x.diaID ? rowData.x.diaID.length : 0}
              </span>
              {`)`}{' '}
              <sup>
                <button
                  type="button"
                  style={{
                    visibility: showUnlinkButtonZoneX ? 'visible' : 'hidden',
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={(e) => onUnlink(e, true, 'x')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : assignmentZone.isActive && assignmentZone.activeAxis === 'x' ? (
            <div>
              {`${rowData.x.pubIntegral} (`}
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
        ) : assignmentZone.isActive && assignmentZone.activeAxis === 'x' ? (
          <div>
            {'0 ('}
            <span style={{ color: 'red', fontWeight: 'bold' }}>0</span>
            {')'}
          </div>
        ) : (
          ''
        )}
      </td>
      <td
        {...rowSpanTags}
        {...onHoverZoneY}
        {...{ onClick: (e) => onClick(e, assignmentZone, 'y') }}
      >
        {lodash.get(rowData, 'y.pubIntegral', 0) > 0 ? (
          lodash.get(rowData, 'y.diaID', []).length > 0 ? (
            <div
              onMouseEnter={() => setShowUnlinkButtonZoneY(true)}
              onMouseLeave={() => setShowUnlinkButtonZoneY(false)}
            >
              {`${rowData.y.pubIntegral}`} {`(`}
              <span
                style={
                  (assignmentZone.isActive &&
                    assignmentZone.activeAxis === 'y') ||
                  (assignmentZone.isOnHover &&
                    assignmentZone.onHoverAxis === 'y') ||
                  highlightZoneY.isActive
                    ? {
                        color: 'red',
                        fontWeight: 'bold',
                      }
                    : { color: 'black', fontWeight: 'normal' }
                }
              >
                {rowData.y.diaID ? rowData.y.diaID.length : 0}
              </span>
              {`)`}{' '}
              <sup>
                <button
                  type="button"
                  style={{
                    visibility: showUnlinkButtonZoneY ? 'visible' : 'hidden',
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={(e) => onUnlink(e, true, 'y')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : assignmentZone.isActive && assignmentZone.activeAxis === 'y' ? (
            <div>
              {`${rowData.y.pubIntegral} (`}
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
            rowData.y.pubIntegral
          )
        ) : assignmentZone.isActive && assignmentZone.activeAxis === 'y' ? (
          <div>
            {'0 ('}
            <span style={{ color: 'red', fontWeight: 'bold' }}>0</span>
            {')'}
          </div>
        ) : (
          ''
        )}
      </td>
    </Fragment>
  );
};

export default ZoneAssignmentsColumn;

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import { FaRegTrashAlt, FaSearchPlus, FaMinusCircle } from 'react-icons/fa';

import { useAssignment } from '../../assignment';
import SelectUncontrolled from '../../elements/SelectUncontrolled';
import { useHighlight } from '../../highlight';
import { HighlightSignalConcatenation } from '../extra/constants/ConcatenationStrings';
import { SignalKinds } from '../extra/constants/SignalsKinds';

const HighlightedRowStyle = css`
  background-color: #ff6f0057;
`;

const ConstantlyHighlightedRowStyle = css`
  background-color: #f5f5dc;
`;

const selectBoxStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const ZonesTableRow = ({
  rowData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  onContextMenu,
}) => {
  const assignmentZone = useAssignment(rowData.id);
  const highlightZone = useHighlight(
    [assignmentZone.id],
    // .concat(
    //   assignmentZone.assigned.x || [],
    //   assignmentZone.assigned.y || [],
    // ),
  );
  const highlightZoneX = useHighlight(
    [`${assignmentZone.id}${HighlightSignalConcatenation}X`].concat(
      assignmentZone.assigned.x || [],
    ),
  );
  const highlightZoneY = useHighlight(
    [`${assignmentZone.id}${HighlightSignalConcatenation}Y`].concat(
      assignmentZone.assigned.y || [],
    ),
  );

  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignalX = useHighlight(
    [`${assignmentSignal.id}${HighlightSignalConcatenation}X`].concat(
      assignmentSignal.assigned.x || [],
    ),
  );
  const highlightSignalY = useHighlight(
    [`${assignmentSignal.id}${HighlightSignalConcatenation}Y`].concat(
      assignmentSignal.assigned.y || [],
    ),
  );

  const [showUnlinkButtonZoneX, setShowUnlinkButtonZoneX] = useState(false);
  const [showUnlinkButtonZoneY, setShowUnlinkButtonZoneY] = useState(false);
  const [showUnlinkButtonSignalX, setShowUnlinkButtonSignalX] = useState(false);
  const [showUnlinkButtonSignalY, setShowUnlinkButtonSignalY] = useState(false);

  const rowSpanTags = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      css:
        Object.prototype.hasOwnProperty.call(rowData.tableMetaInfo, 'hide') &&
        rowData.tableMetaInfo.hide === true
          ? { display: 'none' }
          : null,
    };
  }, [rowData.tableMetaInfo]);

  const getOriginal = useCallback(() => {
    const _rowData = Object.assign({}, rowData);
    delete _rowData.tableMetaInfo;

    return _rowData;
  }, [rowData]);

  const handleOnUnlink = useCallback(
    (e, isOnZoneLevel, axis) => {
      // event handling here in case of unlink button clicked
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      onUnlink(
        getOriginal(),
        isOnZoneLevel,
        rowData.tableMetaInfo.signalIndex,
        axis,
      );
      if (axis === 'x') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneX(false);
            assignmentZone.removeAll('x');
          } else {
            setShowUnlinkButtonSignalX(false);
            assignmentSignal.removeAll('x');
          }
        } else {
          setShowUnlinkButtonZoneX(false);
          setShowUnlinkButtonSignalX(false);
        }
      } else if (axis === 'y') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneY(false);
            assignmentZone.removeAll('y');
          } else {
            setShowUnlinkButtonSignalY(false);
            assignmentSignal.removeAll('y');
          }
        } else {
          setShowUnlinkButtonZoneY(false);
          setShowUnlinkButtonSignalY(false);
        }
      } else {
        setShowUnlinkButtonZoneX(false);
        assignmentZone.removeAll('x');
        setShowUnlinkButtonSignalX(false);
        assignmentSignal.removeAll('x');
        setShowUnlinkButtonZoneY(false);
        assignmentZone.removeAll('y');
        setShowUnlinkButtonSignalY(false);
        assignmentSignal.removeAll('y');
      }
    },
    [
      assignmentSignal,
      assignmentZone,
      getOriginal,
      onUnlink,
      rowData.tableMetaInfo.signalIndex,
    ],
  );

  const handleOnDelete = useCallback(() => {
    onDelete(getOriginal());
  }, [getOriginal, onDelete]);

  const handleOnZoom = useCallback(() => {
    onZoom(getOriginal());
  }, [getOriginal, onZoom]);

  const handleOnClick = useCallback((e, assignment, axis) => {
    assignment.onClick(e, axis);
  }, []);

  const onHoverZoneX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.onMouseEnter('x');
        highlightZoneX.show();
      },
      onMouseLeave: () => {
        assignmentZone.onMouseLeave('x');
        highlightZoneX.hide();
      },
    };
  }, [assignmentZone, highlightZoneX]);

  const onHoverZoneY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentZone.onMouseEnter('y');
        highlightZoneY.show();
      },
      onMouseLeave: () => {
        assignmentZone.onMouseLeave('y');
        highlightZoneY.hide();
      },
    };
  }, [assignmentZone, highlightZoneY]);

  const onHoverSignalX = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('x');
        highlightSignalX.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('x');
        highlightSignalX.hide();
      },
    };
  }, [assignmentSignal, highlightSignalX]);

  const onHoverSignalY = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('y');
        highlightSignalY.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('y');
        highlightSignalY.hide();
      },
    };
  }, [assignmentSignal, highlightSignalY]);

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, getOriginal())}
      css={
        highlightZone.isActive || assignmentZone.isActive
          ? HighlightedRowStyle
          : Object.prototype.hasOwnProperty.call(
              rowData.tableMetaInfo,
              'isConstantlyHighlighted',
            ) && rowData.tableMetaInfo.isConstantlyHighlighted === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlightZone.onHover}
    >
      <td {...rowSpanTags}>{rowData.tableMetaInfo.rowIndex + 1}</td>
      <td {...onHoverSignalX}>
        {rowData.tableMetaInfo.signal.x.delta.toFixed(2)}
      </td>
      <td {...onHoverSignalY}>
        {rowData.tableMetaInfo.signal.y.delta.toFixed(2)}
      </td>
      <td
        {...onHoverSignalX}
        {...{ onClick: (e) => handleOnClick(e, assignmentSignal, 'x') }}
        css={
          highlightSignalX.isActive ||
          (assignmentSignal.isActive && assignmentSignal.activeAxis === 'x')
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {rowData.tableMetaInfo.signal &&
        rowData.tableMetaInfo.signal.x.diaID &&
        rowData.tableMetaInfo.signal.x.diaID.length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButtonSignalX(true)}
            onMouseLeave={() => setShowUnlinkButtonSignalX(false)}
          >
            {rowData.tableMetaInfo.signal.x.diaID.length}{' '}
            <sup>
              <button
                type="button"
                css={{
                  visibility: showUnlinkButtonSignalX ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => handleOnUnlink(e, false, 'x')}
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
        {...{ onClick: (e) => handleOnClick(e, assignmentSignal, 'y') }}
        css={
          highlightSignalY.isActive ||
          (assignmentSignal.isActive && assignmentSignal.activeAxis === 'y')
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {rowData.tableMetaInfo.signal &&
        rowData.tableMetaInfo.signal.y.diaID &&
        rowData.tableMetaInfo.signal.y.diaID.length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButtonSignalY(true)}
            onMouseLeave={() => setShowUnlinkButtonSignalY(false)}
          >
            {rowData.tableMetaInfo.signal.y.diaID.length}{' '}
            <sup>
              <button
                type="button"
                css={{
                  visibility: showUnlinkButtonSignalY ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => handleOnUnlink(e, false, 'y')}
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
      <td
        {...rowSpanTags}
        {...onHoverZoneX}
        {...{ onClick: (e) => handleOnClick(e, assignmentZone, 'x') }}
      >
        {rowData.x.pubIntegral !== undefined && rowData.x.pubIntegral > 0 ? (
          rowData.x.diaID && rowData.x.diaID.length > 0 ? (
            <div
              onMouseEnter={() => setShowUnlinkButtonZoneX(true)}
              onMouseLeave={() => setShowUnlinkButtonZoneX(false)}
            >
              {`${rowData.x.pubIntegral}`} {`(`}
              <span
                css={
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
                  css={{
                    visibility: showUnlinkButtonZoneX ? 'visible' : 'hidden',
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={(e) => handleOnUnlink(e, true, 'x')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : assignmentZone.isActive && assignmentZone.activeAxis === 'x' ? (
            <div>
              {`${rowData.x.pubIntegral} (`}
              <span
                css={{
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
            <span css={{ color: 'red', fontWeight: 'bold' }}>0</span>
            {')'}
          </div>
        ) : (
          ''
        )}
      </td>
      <td
        {...rowSpanTags}
        {...onHoverZoneY}
        {...{ onClick: (e) => handleOnClick(e, assignmentZone, 'y') }}
      >
        {rowData.y.pubIntegral !== undefined && rowData.y.pubIntegral > 0 ? (
          rowData.y.diaID && rowData.y.diaID.length > 0 ? (
            <div
              onMouseEnter={() => setShowUnlinkButtonZoneY(true)}
              onMouseLeave={() => setShowUnlinkButtonZoneY(false)}
            >
              {`${rowData.y.pubIntegral}`} {`(`}
              <span
                css={
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
                  css={{
                    visibility: showUnlinkButtonZoneY ? 'visible' : 'hidden',
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={(e) => handleOnUnlink(e, true, 'y')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : assignmentZone.isActive && assignmentZone.activeAxis === 'y' ? (
            <div>
              {`${rowData.y.pubIntegral} (`}
              <span
                css={{
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
            <span css={{ color: 'red', fontWeight: 'bold' }}>0</span>
            {')'}
          </div>
        ) : (
          ''
        )}
      </td>
      <td>
        <SelectUncontrolled
          onChange={(value) => {
            onChangeKind(rowData, value);
          }}
          data={SignalKinds}
          value={rowData.tableMetaInfo.signal.kind}
          style={selectBoxStyle}
        />
      </td>
      <td {...rowSpanTags}>
        <button
          type="button"
          className="delete-button"
          onClick={handleOnDelete}
        >
          <FaRegTrashAlt />
        </button>
        <button type="button" className="zoom-button" onClick={handleOnZoom}>
          <FaSearchPlus title="Zoom to zone in spectrum" />
        </button>
      </td>
    </tr>
  );
};

export default ZonesTableRow;

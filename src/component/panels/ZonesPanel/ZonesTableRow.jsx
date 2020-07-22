/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import { FaRegTrashAlt, FaSearchPlus, FaMinusCircle } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import SelectUncontrolled from '../../elements/SelectUncontrolled';
import { useHighlight, useHighlightData } from '../../highlight';
import {
  UNSET_ACTIVE_ASSIGNMENT_AXIS,
  SET_ACTIVE_ASSIGNMENT_AXIS,
} from '../../reducer/types/Types';
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
  const dispatch = useDispatch();

  const highlightIDsZoneX = useMemo(() => {
    return [].concat(
      [`${rowData.id}${HighlightSignalConcatenation}X`],
      rowData.x.diaID ? rowData.x.diaID : [],
    );
  }, [rowData.id, rowData.x.diaID]);
  const highlightIDsZoneY = useMemo(() => {
    return [].concat(
      [`${rowData.id}${HighlightSignalConcatenation}Y`],
      rowData.y.diaID ? rowData.y.diaID : [],
    );
  }, [rowData.y.diaID, rowData.id]);
  const highlightIDsSignalX = useMemo(() => {
    return [].concat(
      [`${rowData.tableMetaInfo.id}${HighlightSignalConcatenation}X`],
      rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.x.diaID
        ? rowData.tableMetaInfo.signal.x.diaID
        : [],
    );
  }, [rowData.tableMetaInfo.id, rowData.tableMetaInfo.signal]);
  const highlightIDsSignalY = useMemo(() => {
    return [].concat(
      [`${rowData.tableMetaInfo.id}${HighlightSignalConcatenation}Y`],
      rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.y.diaID
        ? rowData.tableMetaInfo.signal.y.diaID
        : [],
    );
  }, [rowData.tableMetaInfo.id, rowData.tableMetaInfo.signal]);

  const highlightZone = useHighlight([rowData.id]);
  const highlightZoneX = useHighlight(highlightIDsZoneX);
  const highlightZoneY = useHighlight(highlightIDsZoneY);
  const highlightSignalX = useHighlight(highlightIDsSignalX);
  const highlightSignalY = useHighlight(highlightIDsSignalY);
  const highlightData = useHighlightData();

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
      // to also exit the assignment mode then
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
      if (axis === 'X') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneX(false);
          } else {
            setShowUnlinkButtonSignalX(false);
          }
        } else {
          setShowUnlinkButtonZoneX(false);
          setShowUnlinkButtonSignalX(false);
        }
      } else if (axis === 'Y') {
        if (isOnZoneLevel !== undefined) {
          if (isOnZoneLevel) {
            setShowUnlinkButtonZoneY(false);
          } else {
            setShowUnlinkButtonSignalY(false);
          }
        } else {
          setShowUnlinkButtonZoneY(false);
          setShowUnlinkButtonSignalY(false);
        }
      }
    },
    [getOriginal, onUnlink, rowData.tableMetaInfo.signalIndex],
  );

  const handleOnDelete = useCallback(
    (e) => {
      handleOnUnlink(e);
      onDelete(getOriginal());
    },
    [getOriginal, handleOnUnlink, onDelete],
  );

  const handleOnZoom = useCallback(() => {
    onZoom(getOriginal());
  }, [getOriginal, onZoom]);

  const handleOnClick = useCallback(
    (e, highlight, axis) => {
      if (highlight.isActivePermanently) {
        dispatch({ type: UNSET_ACTIVE_ASSIGNMENT_AXIS });
      } else {
        dispatch({ type: SET_ACTIVE_ASSIGNMENT_AXIS, axis: axis });
      }
      highlight.click(e);
    },
    [dispatch],
  );

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, getOriginal())}
      css={
        highlightZone.isActive || highlightZone.isActivePermanently
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
      <td {...highlightSignalX.onHover} {...highlightSignalX.onClick}>
        {rowData.tableMetaInfo.signal.x.delta.toFixed(2)}
      </td>
      <td {...highlightSignalY.onHover} {...highlightSignalY.onClick}>
        {rowData.tableMetaInfo.signal.y.delta.toFixed(2)}
      </td>
      <td
        {...highlightSignalX.onHover}
        {...{ onClick: (e) => handleOnClick(e, highlightSignalX, 'X') }}
        css={
          highlightSignalX.isActivePermanently || highlightSignalX.isActive
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
                onClick={(e) => handleOnUnlink(e, false, 'X')}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : highlightSignalX.isActivePermanently ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td
        {...highlightSignalY.onHover}
        {...{ onClick: (e) => handleOnClick(e, highlightSignalY, 'Y') }}
        css={
          highlightSignalY.isActivePermanently || highlightSignalY.isActive
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
                onClick={(e) => handleOnUnlink(e, false, 'Y')}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : highlightSignalY.isActivePermanently ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td
        {...{
          ...rowSpanTags,
          css: {
            ...rowSpanTags.css,
            color: highlightZoneX.isActivePermanently ? 'red' : 'black',
            fontWeight: highlightZoneX.isActivePermanently ? 'bold' : 'normal',
          },
        }}
        {...{ onClick: (e) => handleOnClick(e, highlightZoneX, 'X') }}
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
                  highlightData.highlight.highlighted.length > 0 &&
                  highlightData.highlight.highlighted.includes(
                    `${rowData.id}${HighlightSignalConcatenation}X`,
                  ) &&
                  !highlightData.highlight.highlighted.find(
                    (_highlight) =>
                      _highlight.split(HighlightSignalConcatenation).length >
                        1 &&
                      _highlight.split(HighlightSignalConcatenation)[0] ===
                        rowData.id,
                  )
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
                  onClick={(e) => handleOnUnlink(e, true, 'X')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : (
            rowData.x.pubIntegral
          )
        ) : highlightZoneX.isActivePermanently ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td
        {...{
          ...rowSpanTags,
          css: {
            ...rowSpanTags.css,
            color: highlightZoneY.isActivePermanently ? 'red' : 'black',
            fontWeight: highlightZoneY.isActivePermanently ? 'bold' : 'normal',
          },
        }}
        {...{ onClick: (e) => handleOnClick(e, highlightZoneY, 'Y') }}
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
                  highlightData.highlight.highlighted.length > 0 &&
                  highlightData.highlight.highlighted.includes(
                    `${rowData.id}${HighlightSignalConcatenation}Y`,
                  ) &&
                  !highlightData.highlight.highlighted.find(
                    (_highlight) =>
                      _highlight.split(HighlightSignalConcatenation).length >
                        1 &&
                      _highlight.split(HighlightSignalConcatenation)[0] ===
                        rowData.id,
                  )
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
                  onClick={(e) => handleOnUnlink(e, true, 'Y')}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : (
            rowData.y.pubIntegral
          )
        ) : highlightZoneY.isActivePermanently ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td>
        <SelectUncontrolled
          onChange={(value) => {
            onChangeKind(
              value,
              getOriginal(),
              rowData.tableMetaInfo.signalIndex,
            );
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

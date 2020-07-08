/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import {
  FaRegTrashAlt,
  FaSearchPlus,
  FaEdit,
  FaMinusCircle,
} from 'react-icons/fa';

import SelectUncontrolled from '../../elements/SelectUncontrolled';
import { useHighlight, useHighlightData } from '../../highlight';
import FormatNumber from '../../utility/FormatNumber';
import { SignalKinds } from '../extra/constants/SignalsKinds';
import { checkMultiplicity } from '../extra/utilities/MultiplicityUtilities';

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

const RangesTableRow = ({
  rowData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  onEdit,
  onContextMenu,
  preferences,
}) => {
  const highlightIDsRange = useMemo(() => {
    return [].concat([rowData.id], rowData.diaID ? rowData.diaID : []);
  }, [rowData.diaID, rowData.id]);
  const highlightIDsSignal = useMemo(() => {
    return [].concat(
      [`${rowData.tableMetaInfo.id}`],
      rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.diaID
        ? rowData.tableMetaInfo.signal.diaID
        : [],
    );
  }, [rowData.tableMetaInfo.id, rowData.tableMetaInfo.signal]);

  const highlightRange = useHighlight(highlightIDsRange);
  const highlightSignal = useHighlight(highlightIDsSignal);
  const highlightData = useHighlightData();

  const [showUnlinkButtonRange, setShowUnlinkButtonRange] = useState(false);
  const [showUnlinkButtonSignal, setShowUnlinkButtonSignal] = useState(false);

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
    (e, isOnRangeLevel) => {
      // event handling here in case of unlink button clicked
      // to also exit the assignment mode then
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // if (highlightSignal.isActivePermanently) {
      //   highlightSignal.click();
      // }
      onUnlink(
        getOriginal(),
        isOnRangeLevel,
        rowData.tableMetaInfo.signalIndex,
      );
      if (isOnRangeLevel !== undefined) {
        if (isOnRangeLevel) {
          setShowUnlinkButtonRange(false);
        } else {
          setShowUnlinkButtonSignal(false);
        }
      } else {
        setShowUnlinkButtonRange(false);
        setShowUnlinkButtonSignal(false);
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

  const handleOnEdit = useCallback(() => {
    onEdit(getOriginal());
  }, [getOriginal, onEdit]);

  const getShowPreference = (showKey) => {
    return preferences
      ? Object.prototype.hasOwnProperty.call(preferences, showKey) &&
          preferences[showKey] === true
      : false;
  };

  const applyFormatPreference = (
    formatKey,
    value,
    prefix = '',
    suffix = '',
  ) => {
    const format =
      preferences &&
      Object.prototype.hasOwnProperty.call(preferences, formatKey)
        ? preferences[formatKey]
        : null;
    return format ? FormatNumber(value, format, prefix, suffix) : value;
  };

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, getOriginal())}
      css={
        highlightRange.isActive || highlightRange.isActivePermanently
          ? HighlightedRowStyle
          : Object.prototype.hasOwnProperty.call(
              rowData.tableMetaInfo,
              'isConstantlyHighlighted',
            ) && rowData.tableMetaInfo.isConstantlyHighlighted === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlightRange.onHover}
    >
      <td {...rowSpanTags} {...highlightRange.onClick}>
        {rowData.tableMetaInfo.rowIndex + 1}
      </td>
      {getShowPreference('showFrom') ? (
        <td {...rowSpanTags} {...highlightRange.onClick}>
          {applyFormatPreference('fromFormat', rowData.from)}
        </td>
      ) : null}
      {getShowPreference('showTo') ? (
        <td {...rowSpanTags} {...highlightRange.onClick}>
          {applyFormatPreference('toFormat', rowData.to)}
        </td>
      ) : null}
      <td {...highlightSignal.onHover} {...highlightSignal.onClick}>
        {rowData.tableMetaInfo.signal
          ? !checkMultiplicity(rowData.tableMetaInfo.signal.multiplicity, ['m'])
            ? `${applyFormatPreference(
                'fromFormat',
                rowData.from,
              )} - ${applyFormatPreference('toFormat', rowData.to)}`
            : rowData.tableMetaInfo.signal.delta.toFixed(3)
          : ''}
      </td>
      {getShowPreference('showRelative') ? (
        <td {...rowSpanTags} {...highlightRange.onClick}>
          {rowData.kind === 'signal'
            ? applyFormatPreference('relativeFormat', rowData.integral)
            : applyFormatPreference(
                'relativeFormat',
                rowData.integral,
                '[',
                ']',
              )}
        </td>
      ) : null}
      {getShowPreference('showAbsolute') ? (
        <td {...rowSpanTags} {...highlightRange.onClick}>
          {applyFormatPreference('absoluteFormat', rowData.absolute)}
        </td>
      ) : null}
      <td {...highlightSignal.onHover} {...highlightSignal.onClick}>
        {rowData.tableMetaInfo.signal
          ? rowData.tableMetaInfo.signal.multiplicity
          : ''}
      </td>
      <td {...highlightSignal.onHover} {...highlightSignal.onClick}>
        {rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.j
          ? rowData.tableMetaInfo.signal.j
              .map((coupling) => coupling.coupling.toFixed(1))
              .join(', ')
          : ''}
      </td>
      <td
        {...highlightSignal.onHover}
        {...highlightSignal.onClick}
        css={
          highlightSignal.isActivePermanently || highlightSignal.isActive
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {rowData.tableMetaInfo.signal &&
        rowData.tableMetaInfo.signal.diaID &&
        rowData.tableMetaInfo.signal.diaID.length > 0 ? (
          <div
            onMouseEnter={() => setShowUnlinkButtonSignal(true)}
            onMouseLeave={() => setShowUnlinkButtonSignal(false)}
          >
            {rowData.tableMetaInfo.signal.diaID.length}{' '}
            <sup>
              <button
                type="button"
                css={{
                  visibility: showUnlinkButtonSignal ? 'visible' : 'hidden',
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => handleOnUnlink(e, false)}
              >
                <FaMinusCircle color="red" />
              </button>
            </sup>
          </div>
        ) : highlightSignal.isActivePermanently ? (
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
            color: highlightRange.isActivePermanently ? 'red' : 'black',
            fontWeight: highlightRange.isActivePermanently ? 'bold' : 'normal',
          },
        }}
        {...highlightRange.onClick}
      >
        {rowData.pubIntegral !== undefined && rowData.pubIntegral > 0 ? (
          rowData.diaID && rowData.diaID.length > 0 ? (
            <div
              onMouseEnter={() => setShowUnlinkButtonRange(true)}
              onMouseLeave={() => setShowUnlinkButtonRange(false)}
            >
              {`${rowData.pubIntegral}`} {`(`}
              <span
                css={
                  highlightData.highlight.highlighted.length > 0 &&
                  highlightData.highlight.highlighted.includes(rowData.id) &&
                  !highlightData.highlight.highlighted.find(
                    (_highlight) =>
                      _highlight.split('_').length > 1 &&
                      _highlight.split('_')[0] === rowData.id,
                  )
                    ? {
                        color: 'red',
                        fontWeight: 'bold',
                      }
                    : { color: 'black', fontWeight: 'normal' }
                }
              >
                {rowData.diaID ? rowData.diaID.length : 0}
              </span>
              {`)`}{' '}
              <sup>
                <button
                  type="button"
                  css={{
                    visibility: showUnlinkButtonRange ? 'visible' : 'hidden',
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={(e) => handleOnUnlink(e, true)}
                >
                  <FaMinusCircle color="red" />
                </button>
              </sup>
            </div>
          ) : (
            rowData.pubIntegral
          )
        ) : highlightRange.isActivePermanently ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td {...highlightSignal.onHover}>
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
        <SelectUncontrolled
          onChange={(value) => {
            onChangeKind(value, getOriginal());
          }}
          data={SignalKinds}
          value={rowData.kind}
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
      </td>
      <td {...rowSpanTags}>
        <button type="button" className="zoom-button" onClick={handleOnZoom}>
          <FaSearchPlus title="Zoom to range in spectrum" />
        </button>
      </td>
      <td {...rowSpanTags}>
        <button type="button" className="edit-button" onClick={handleOnEdit}>
          <FaEdit color="blue" />
        </button>
      </td>
    </tr>
  );
};

export default RangesTableRow;

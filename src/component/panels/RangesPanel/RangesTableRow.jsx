/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  FaRegTrashAlt,
  FaLink,
  FaSearchPlus,
  FaEdit,
  FaUnlink,
} from 'react-icons/fa';

import SelectUncontrolled from '../../elements/SelectUncontrolled';
import { useHighlight } from '../../highlight';
import FormatNumber from '../../utility/FormatNumber';
import { SignalKinds } from '../extra/constants/SignalsKinds';

const HighlightedRowStyle = css`
  background-color: #ff6f0057;
`;

const ConstantlyHighlightedRowStyle = css`
  background-color: #f5f5dc;
`;

const selectStyle = {
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
  checkOnRangeLevel,
}) => {
  const highlightIDsSignal = useMemo(() => {
    return [].concat(
      rowData.tableMetaInfo.id !== undefined
        ? [`${rowData.tableMetaInfo.id}`]
        : [rowData.id],
      rowData.tableMetaInfo.signal &&
        checkOnRangeLevel(rowData.tableMetaInfo.signal.multiplicity) &&
        rowData.diaID
        ? rowData.diaID
        : rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.diaID
        ? rowData.tableMetaInfo.signal.diaID
        : [],
    );
  }, [
    checkOnRangeLevel,
    rowData.diaID,
    rowData.id,
    rowData.tableMetaInfo.id,
    rowData.tableMetaInfo.signal,
  ]);

  const highlightRange = useHighlight([rowData.id]);
  const highlightSignal = useHighlight(highlightIDsSignal);

  const [showUnlinkButton, setShowUnlinkButton] = useState(false);

  useEffect(() => {
    const isLinked = checkOnRangeLevel(
      rowData.tableMetaInfo.signal.multiplicity,
    )
      ? rowData.diaID && rowData.diaID.length > 0
      : rowData.tableMetaInfo.signal &&
        rowData.tableMetaInfo.signal.diaID &&
        rowData.tableMetaInfo.signal.diaID.length > 0;

    setShowUnlinkButton(isLinked);
  }, [checkOnRangeLevel, rowData]);

  const rowSpanTags = useMemo(() => {
    return {
      rowSpan: rowData.tableMetaInfo.rowSpan,
      style:
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
    (e) => {
      // event handling here in case of unlink button clicked
      // to also exit the assignment mode then
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowUnlinkButton(false);
      if (highlightSignal.isActivePermanently) {
        highlightSignal.click();
      }
      onUnlink(getOriginal(), rowData.tableMetaInfo.signalIndex);
    },
    [getOriginal, highlightSignal, onUnlink, rowData.tableMetaInfo.signalIndex],
  );

  const handleOnDelete = useCallback(() => {
    handleOnUnlink();
    onDelete(getOriginal());
  }, [getOriginal, handleOnUnlink, onDelete]);

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
      <td {...rowSpanTags}>{rowData.tableMetaInfo.rowIndex + 1}</td>
      {getShowPreference('showFrom') ? (
        <td {...rowSpanTags}>
          {applyFormatPreference('fromFormat', rowData.from)}
        </td>
      ) : null}
      {getShowPreference('showTo') ? (
        <td {...rowSpanTags}>
          {applyFormatPreference('toFormat', rowData.to)}
        </td>
      ) : null}
      <td {...highlightSignal.onHover} {...highlightSignal.onClick}>
        {rowData.tableMetaInfo.signal
          ? checkOnRangeLevel(rowData.tableMetaInfo.signal.multiplicity)
            ? `${applyFormatPreference(
                'fromFormat',
                rowData.from,
              )} - ${applyFormatPreference('toFormat', rowData.to)}`
            : rowData.tableMetaInfo.signal.delta.toFixed(3)
          : ''}
      </td>
      {getShowPreference('showRelative') ? (
        <td {...rowSpanTags}>
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
        <td {...rowSpanTags}>
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
        style={
          highlightSignal.isActivePermanently || highlightSignal.isActive
            ? {
                color: 'red',
                fontWeight: 'bold',
              }
            : null
        }
      >
        {rowData.tableMetaInfo.signal &&
        rowData.tableMetaInfo.signal.multiplicity &&
        checkOnRangeLevel(rowData.tableMetaInfo.signal.multiplicity)
          ? rowData.diaID && rowData.diaID.length > 0
            ? rowData.diaID.length
            : highlightSignal.isActivePermanently
            ? '0'
            : ''
          : rowData.tableMetaInfo.signal &&
            rowData.tableMetaInfo.signal.diaID &&
            rowData.tableMetaInfo.signal.diaID.length > 0
          ? rowData.tableMetaInfo.signal.diaID.length
          : highlightSignal.isActivePermanently
          ? '0'
          : ''}
      </td>
      <td {...highlightSignal.onHover} {...highlightSignal.onClick}>
        {showUnlinkButton || highlightSignal.isActivePermanently ? (
          <button
            type="button"
            className="unlink-button"
            onClick={handleOnUnlink}
          >
            {highlightSignal.isActivePermanently ? (
              <FaLink color="red" />
            ) : (
              <FaUnlink />
            )}
          </button>
        ) : null}
      </td>
      <td {...rowSpanTags}>
        {rowData.pubIntegral !== undefined && rowData.pubIntegral > 0
          ? rowData.pubIntegral
          : null}
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
          value={
            checkOnRangeLevel(rowData.tableMetaInfo.signal.multiplicity)
              ? rowData.kind
              : rowData.tableMetaInfo.signal.kind
          }
          style={selectStyle}
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
          <FaSearchPlus title="Zoom to range in spectrum view" />
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

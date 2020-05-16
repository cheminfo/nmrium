/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import { FaRegTrashAlt, FaLink } from 'react-icons/fa';

import {
  HighlightedRowStyle,
  ConstantlyHighlightedRowStyle,
} from '../elements/ReactTable/Style';
import SelectUncontrolled from '../elements/SelectUncontrolled';
import { useHighlight } from '../highlight';
import FormatNumber from '../utility/FormatNumber';

import { SignalKinds } from './constants/SignalsKinds';

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
  onContextMenu,
  preferences,
}) => {
  const highlight = useHighlight([
    Object.prototype.hasOwnProperty.call(rowData, 'id') ? rowData.id : '',
  ]);

  const [showUnlinkButton, setShowUnlinkButton] = useState(false);

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

  const stopPropagationOnClickTag = {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
  };

  const getOriginal = useCallback(() => {
    const _rowData = Object.assign({}, rowData);
    delete _rowData.tableMetaInfo;

    return _rowData;
  }, [rowData]);

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
      onContextMenu={onContextMenu}
      css={
        highlight.isActive || highlight.isActivePermanently
          ? HighlightedRowStyle
          : Object.prototype.hasOwnProperty.call(
              rowData.tableMetaInfo,
              'isConstantlyHighlighted',
            ) && rowData.tableMetaInfo.isConstantlyHighlighted === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlight.onHover}
      {...highlight.onClick}
    >
      <td {...rowSpanTags}>{rowData.tableMetaInfo.index}</td>
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
      <td>
        {rowData.tableMetaInfo.signal.multiplicity === 's' ||
        rowData.tableMetaInfo.signal.j
          ? rowData.tableMetaInfo.signal.delta.toFixed(3)
          : `${rowData.from.toFixed(2)} - ${rowData.to.toFixed(2)}`}
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
      <td>{rowData.tableMetaInfo.signal.multiplicity}</td>
      <td>
        {rowData.tableMetaInfo.signal.j
          ? rowData.tableMetaInfo.signal.j
              .map((coupling) => coupling.coupling.toFixed(1))
              .join(', ')
          : ''}
      </td>
      <td {...rowSpanTags} {...stopPropagationOnClickTag}>
        {showUnlinkButton || highlight.isActivePermanently ? (
          <button
            type="button"
            className="unlink-button"
            onClick={() => {
              setShowUnlinkButton(false);
              if (highlight.isActivePermanently) {
                highlight.click();
              }
              onUnlink(getOriginal());
            }}
          >
            <FaLink color={highlight.isActivePermanently ? 'grey' : 'black'} />
          </button>
        ) : null}
      </td>
      <td {...rowSpanTags} {...stopPropagationOnClickTag}>
        <SelectUncontrolled
          onChange={(value) => {
            onChangeKind(value, getOriginal());
          }}
          data={SignalKinds}
          value={rowData.kind}
          style={selectStyle}
        />
      </td>
      <td {...rowSpanTags} {...stopPropagationOnClickTag}>
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(getOriginal())}
        >
          <FaRegTrashAlt />
        </button>
      </td>
    </tr>
  );
};

export default RangesTableRow;

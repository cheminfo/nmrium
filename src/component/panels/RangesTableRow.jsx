/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { FaRegTrashAlt, FaLink } from 'react-icons/fa';

import SelectUncontrolled from '../elements/SelectUncontrolled';
import { useHighlight } from '../highlight';
import FormatNumber from '../utility/FormatNumber';

import { SignalKinds } from './constants/SignalsKinds';

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
  onContextMenu,
  preferences,
}) => {
  const highlightIDs = useMemo(() => {
    return [].concat(
      [rowData.id],
      rowData.diaID ? rowData.diaID : [],
      rowData.signal ? rowData.signal.map((signal) => signal.diaID).flat() : [],
    );
  }, [rowData]);

  const highlight = useHighlight(highlightIDs);

  const [showUnlinkButton, setShowUnlinkButton] = useState(false);

  useEffect(() => {
    const isLinked =
      (rowData.diaID && rowData.diaID.length > 0) ||
      (rowData.signal &&
        rowData.signal.map((signal) => signal.diaID).flat().length > 0);
    setShowUnlinkButton(isLinked);
  }, [rowData]);

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

  const handleOnUnlink = useCallback(
    (e) => {
      // event handling here in case of unlink button clicked
      // because it should still be able to activate the linkage mode
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowUnlinkButton(false);
      if (highlight.isActivePermanently) {
        highlight.click();
      }
      highlight.remove(highlightIDs.filter((id) => id !== rowData.id));
      onUnlink(getOriginal());
    },
    [getOriginal, highlight, highlightIDs, onUnlink, rowData.id],
  );

  const handleOnDelete = useCallback(() => {
    // no manual event handling because it's already handled by stopPropagationOnClickTag
    handleOnUnlink();
    onDelete(getOriginal());
  }, [getOriginal, handleOnUnlink, onDelete]);

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
        {rowData.tableMetaInfo.signal.multiplicity === 'm'
          ? `${rowData.from.toFixed(2)} - ${rowData.to.toFixed(2)}`
          : rowData.tableMetaInfo.signal.delta.toFixed(3)}
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
      <td {...rowSpanTags}>
        {showUnlinkButton || highlight.isActivePermanently ? (
          <button
            type="button"
            className="unlink-button"
            onClick={handleOnUnlink}
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
          onClick={handleOnDelete}
        >
          <FaRegTrashAlt />
        </button>
      </td>
    </tr>
  );
};

export default RangesTableRow;

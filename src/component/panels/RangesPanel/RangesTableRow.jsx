/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useState } from 'react';
import {
  FaRegTrashAlt,
  FaSearchPlus,
  FaEdit,
  FaMinusCircle,
} from 'react-icons/fa';

import { useAssignment } from '../../assignment';
import SelectUncontrolled from '../../elements/SelectUncontrolled';
import { useHighlight, useHighlightData } from '../../highlight';
import FormatNumber from '../../utility/FormatNumber';
import { HighlightSignalConcatenation } from '../extra/constants/ConcatenationStrings';
import {
  SignalKinds,
  SignalKindsToConsiderInIntegralsSum,
} from '../extra/constants/SignalsKinds';
import { checkMultiplicity } from '../extra/utilities/MultiplicityUtilities';
import { checkSignalKinds } from '../extra/utilities/RangeUtilities';

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
  const assignmentRange = useAssignment(rowData.id);
  const highlightRange = useHighlight(
    [assignmentRange.id].concat(assignmentRange.assigned.x || []),
  );
  const assignmentSignal = useAssignment(rowData.tableMetaInfo.id);
  const highlightSignal = useHighlight(
    [assignmentSignal.id].concat(assignmentSignal.assigned.x || []),
  );
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
      onUnlink(
        getOriginal(),
        isOnRangeLevel,
        rowData.tableMetaInfo.signalIndex,
      );
      if (isOnRangeLevel !== undefined) {
        if (isOnRangeLevel) {
          setShowUnlinkButtonRange(false);
          assignmentRange.removeAll('x');
        } else {
          setShowUnlinkButtonSignal(false);
          assignmentSignal.removeAll('x');
        }
      } else {
        setShowUnlinkButtonRange(false);
        setShowUnlinkButtonSignal(false);
      }
    },
    [
      assignmentRange,
      assignmentSignal,
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

  const handleOnClick = useCallback((e, assignment) => {
    assignment.onClick(e, 'x');
  }, []);

  const onHoverRange = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentRange.onMouseEnter('x');
        highlightRange.show();
      },
      onMouseLeave: () => {
        assignmentRange.onMouseLeave('x');
        highlightRange.hide();
      },
    };
  }, [assignmentRange, highlightRange]);

  const onHoverSignal = useMemo(() => {
    return {
      onMouseEnter: () => {
        assignmentSignal.onMouseEnter('x');
        highlightSignal.show();
      },
      onMouseLeave: () => {
        assignmentSignal.onMouseLeave('x');
        highlightSignal.hide();
      },
    };
  }, [assignmentSignal, highlightSignal]);

  return (
    <tr
      onContextMenu={(e) => onContextMenu(e, getOriginal())}
      css={
        highlightRange.isActive || assignmentRange.isActive
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
      <td {...rowSpanTags} {...onHoverRange}>
        {rowData.tableMetaInfo.rowIndex + 1}
      </td>
      {getShowPreference('showFrom') ? (
        <td {...rowSpanTags} {...onHoverRange}>
          {applyFormatPreference('fromFormat', rowData.from)}
        </td>
      ) : null}
      {getShowPreference('showTo') ? (
        <td {...rowSpanTags} {...onHoverRange}>
          {applyFormatPreference('toFormat', rowData.to)}
        </td>
      ) : null}
      <td {...onHoverSignal}>
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
        <td {...rowSpanTags} {...onHoverRange}>
          {checkSignalKinds(rowData, SignalKindsToConsiderInIntegralsSum)
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
        <td {...rowSpanTags} {...onHoverRange}>
          {applyFormatPreference('absoluteFormat', rowData.absolute)}
        </td>
      ) : null}
      <td {...onHoverSignal}>
        {rowData.tableMetaInfo.signal
          ? rowData.tableMetaInfo.signal.multiplicity
          : ''}
      </td>
      <td {...onHoverSignal}>
        {rowData.tableMetaInfo.signal && rowData.tableMetaInfo.signal.j
          ? rowData.tableMetaInfo.signal.j
              .map((coupling) => coupling.coupling.toFixed(1))
              .join(', ')
          : ''}
      </td>
      <td
        {...onHoverSignal}
        {...{ onClick: (e) => handleOnClick(e, assignmentSignal) }}
        css={
          assignmentSignal.isActive || highlightSignal.isActive
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
        ) : assignmentSignal.isActive ? (
          '0'
        ) : (
          ''
        )}
      </td>
      <td
        {...rowSpanTags}
        {...onHoverRange}
        {...{ onClick: (e) => handleOnClick(e, assignmentRange) }}
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
                  assignmentRange.isActive ||
                  assignmentRange.isOnHover ||
                  (highlightRange.isActive &&
                    !highlightData.highlight.highlighted.find(
                      (_highlighted) => {
                        const split = _highlighted.split(
                          HighlightSignalConcatenation,
                        );
                        return (
                          split[0] === assignmentRange.id && split.length > 1
                        );
                      },
                    ))
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
          ) : assignmentRange.isActive ? (
            <div>
              {`${rowData.pubIntegral} (`}
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
            rowData.pubIntegral
          )
        ) : assignmentRange.isActive ? (
          <div>
            {'0 ('}
            <span css={{ color: 'red', fontWeight: 'bold' }}>0</span>
            {')'}
          </div>
        ) : (
          ''
        )}
      </td>
      <td {...onHoverSignal}>
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
          <FaSearchPlus title="Zoom to range in spectrum" />
        </button>
        <button type="button" className="edit-button" onClick={handleOnEdit}>
          <FaEdit color="blue" />
        </button>
      </td>
    </tr>
  );
};

export default RangesTableRow;

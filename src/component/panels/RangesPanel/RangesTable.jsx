/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import ContextMenu from '../../elements/ContextMenu';

import RangesTableRow from './RangesTableRow';

const tableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;
  .react-contextmenu-wrapper {
    display: contents;
  }
  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }
  th,
  td {
    white-space: nowrap;
    text-align: center;
    margin: 0;
    padding: 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    :last-child {
      border-right: 0;
    }
    button {
      background-color: transparent;
      border: none;
    }
    .unlink-button {
      padding: 0;
      font-size: 10px;
    }
  }
`;

const RangesTable = ({
  tableData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  onEdit,
  context,
  preferences,
  element,
}) => {
  const contextRef = useRef();

  const data = useMemo(() => {
    const _rangesData = [];
    tableData.forEach((range, i) => {
      if (range.signal.length === 1) {
        _rangesData.push({
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            signal: range.signal[0],
            rowIndex: i,
            signalIndex: 0,
            id: `${range.id}_${0}`,
          },
        });
      } else if (range.signal.length > 1) {
        range.signal.forEach((signal, j) => {
          let hide = false;
          let rowSpan = null;
          if (j < range.signal.length - 1) {
            if (j === 0) {
              rowSpan = range.signal.length;
            } else {
              hide = true;
            }
          } else {
            hide = true;
          }

          _rangesData.push({
            ...range,
            tableMetaInfo: {
              ...range.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: `${range.id}_${j}`,
            },
          });
        });
      }
    });

    return _rangesData;
  }, [tableData]);

  const getShowPreference = (showPreference) => {
    return preferences
      ? Object.prototype.hasOwnProperty.call(preferences, showPreference) &&
          preferences[showPreference] === true
      : false;
  };

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, rowData);
    },
    [contextRef],
  );

  return (
    <div>
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>#</th>
            {getShowPreference('showFrom') ? <th>From</th> : null}
            {getShowPreference('showTo') ? <th>To</th> : null}
            <th>δ (ppm)</th>
            {getShowPreference('showRelative') ? <th>Rel. {element}</th> : null}
            {getShowPreference('showAbsolute') ? <th>Absolute</th> : null}
            <th>Mult.</th>
            <th>J (Hz)</th>
            <th>
              <FaLink style={{ fontSize: 10 }} />
            </th>
            <th>Σ</th>
            <th>Kind (S)</th>
            <th>Kind (R)</th>
            <th>{''}</th>
          </tr>
          {data &&
            data.map((range, i) => {
              return (
                <RangesTableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`rangesTableRow${i}`}
                  rowData={data[i]}
                  onChangeKind={onChangeKind}
                  onDelete={onDelete}
                  onUnlink={onUnlink}
                  onZoom={onZoom}
                  onEdit={onEdit}
                  onContextMenu={(e, rowData) => contextMenuHandler(e, rowData)}
                  preferences={preferences}
                />
              );
            })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </div>
  );
};

export default RangesTable;

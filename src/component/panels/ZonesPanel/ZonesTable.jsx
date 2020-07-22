/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import ContextMenu from '../../elements/ContextMenu';
import { HighlightSignalConcatenation } from '../extra/constants/ConcatenationStrings';

import ZonesTableRow from './ZonesTableRow';

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
  }
`;

const ZonesTable = ({
  tableData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  context,
  preferences,
  nuclei,
}) => {
  const contextRef = useRef();
  const data = useMemo(() => {
    const _zonesData = [];
    tableData.forEach((zone, i) => {
      if (zone.signal.length === 1) {
        _zonesData.push({
          ...zone,
          tableMetaInfo: {
            ...zone.tableMetaInfo,
            signal: zone.signal[0],
            rowIndex: i,
            signalIndex: 0,
            id: `${zone.id}${HighlightSignalConcatenation}${0}`,
          },
        });
      } else if (zone.signal.length > 1) {
        zone.signal.forEach((signal, j) => {
          let hide = false;
          let rowSpan = null;
          if (j < zone.signal.length - 1) {
            if (j === 0) {
              rowSpan = zone.signal.length;
            } else {
              hide = true;
            }
          } else {
            hide = true;
          }

          _zonesData.push({
            ...zone,
            tableMetaInfo: {
              ...zone.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: `${zone.id}${HighlightSignalConcatenation}${j}`,
            },
          });
        });
      }
    });

    return _zonesData;
  }, [tableData]);

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
            <th rowSpan={2}>#</th>
            <th colSpan={2}>δ (ppm)</th>
            <th colSpan={2}>
              <FaLink />
            </th>
            <th colSpan={2}>Σ</th>
            <th rowSpan={2}>Kind</th>
            <th rowSpan={2}>{''}</th>
          </tr>
          <tr>
            <th>{nuclei[0]}</th>
            <th>{nuclei[1]}</th>
            <th>{nuclei[0]}</th>
            <th>{nuclei[1]}</th>
            <th>{nuclei[0]}</th>
            <th>{nuclei[1]}</th>
          </tr>
          {data &&
            data.map((range, i) => {
              return (
                <ZonesTableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`zonesTableRow${i}`}
                  rowData={data[i]}
                  onChangeKind={onChangeKind}
                  onDelete={onDelete}
                  onUnlink={onUnlink}
                  onZoom={onZoom}
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

export default ZonesTable;

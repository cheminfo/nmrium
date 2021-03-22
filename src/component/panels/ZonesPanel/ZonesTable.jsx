/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo, useCallback, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import ContextMenu from '../../elements/ContextMenu';

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
    padding: 0.1rem 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    :last-child {
      border-right: 0;
    }
    button {
      background-color: transparent;
      border: none;
      padding: 0 5px;
    }
  }
`;

function ZonesTable({ tableData, onUnlink, context, nuclei, preferences }) {
  const contextRef = useRef();

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, rowData);
      }
    },
    [contextRef],
  );

  const data = useMemo(() => {
    const _data = [];
    tableData.forEach((zone, i) => {
      if (zone.signal.length === 1) {
        _data.push({
          ...zone,
          tableMetaInfo: {
            ...zone.tableMetaInfo,
            signal: zone.signal[0],
            rowIndex: i,
            signalIndex: 0,
            id: zone.signal[0].id,
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
          _data.push({
            ...zone,
            tableMetaInfo: {
              ...zone.tableMetaInfo,
              signal,
              rowSpan,
              hide,
              rowIndex: i,
              signalIndex: j,
              id: signal.id,
            },
          });
        });
      }
    });

    return _data;
  }, [tableData]);

  const rows = useMemo(
    () =>
      data.map((rowData) => (
        <ZonesTableRow
          key={`zonesTableRow_${rowData.tableMetaInfo.id}`}
          rowData={rowData}
          onUnlink={onUnlink}
          onContextMenu={(e, rowData) => contextMenuHandler(e, rowData)}
          preferences={preferences}
        />
      )),
    [contextMenuHandler, data, onUnlink, preferences],
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
          {rows}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </div>
  );
}

export default ZonesTable;

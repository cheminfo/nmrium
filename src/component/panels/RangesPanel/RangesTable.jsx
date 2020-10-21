/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import ContextMenu from '../../elements/ContextMenu';
import useToggleStatus from '../extra/utilities/UseToggleStatus';

import RangesTableRow from './RangesTableRow';
import useMapRanges from './useMapRanges';

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
  const data = useMapRanges(tableData);
  const [relativeFlags, toggleResltiveColumn] = useToggleStatus(
    'id',
    tableData,
  );

  const isVisible = (key) => {
    return lodash.get(preferences, key, false);
  };

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, rowData);
    },
    [contextRef],
  );

  const editStartHander = useCallback(
    (id) => {
      toggleResltiveColumn(id);
    },
    [toggleResltiveColumn],
  );

  useEffect(() => {
    const handleEditStart = () => {
      editStartHander(null);
    };
    document.addEventListener('mousedown', handleEditStart);
    return () => document.removeEventListener('mousedown', handleEditStart);
  }, [editStartHander]);

  return (
    <div>
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>#</th>
            {isVisible('showFrom') ? <th>From</th> : null}
            {isVisible('showTo') ? <th>To</th> : null}
            <th>δ (ppm)</th>
            {isVisible('showRelative') ? <th>Rel. {element}</th> : null}
            {isVisible('showAbsolute') ? <th>Absolute</th> : null}
            <th>Mult.</th>
            <th>J (Hz)</th>
            <th>
              <FaLink style={{ fontSize: 10 }} />
            </th>
            <th>Σ</th>
            <th>Kind</th>
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
                  onRelativeColumnEditStart={editStartHander}
                  relativeFlags={relativeFlags}
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

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

import checkModifierKeyActivated from '../../../data/utilities/checkModifierKeyActivated';
import { useGlobal } from '../../context/GlobalContext';
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

function RangesTable({
  tableData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  onEdit,
  context,
  activeTab,
  preferences,
}) {
  const element = activeTab && activeTab.replace(/[0-9]/g, '');
  const contextRef = useRef();
  const data = useMapRanges(tableData);
  const [relativeFlags, toggleRelativeColumn] = useToggleStatus('id', data);
  const [signalFlags, toggleSignalColumn] = useToggleStatus('id', data);
  const { rootRef } = useGlobal();

  const isVisible = (key) => {
    return lodash.get(preferences, key, false);
  };

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      if (!checkModifierKeyActivated(e)) {
        e.preventDefault();
        contextRef.current.handleContextMenu(e, rowData);
      }
    },
    [contextRef],
  );

  const columnEditStartHandler = useCallback(
    (columnKey, id) => {
      if (columnKey === 'relative') {
        toggleRelativeColumn(id);
      } else if (columnKey === 'signal') {
        toggleSignalColumn(id);
      }
    },
    [toggleRelativeColumn, toggleSignalColumn],
  );

  useEffect(() => {
    const handleEditStart = () => {
      columnEditStartHandler('realtive', null);
      columnEditStartHandler('signal', null);
    };
    if (rootRef) {
      rootRef.addEventListener('mousedown', handleEditStart);
    }
    return () => {
      if (rootRef) {
        rootRef.removeEventListener('mousedown', handleEditStart);
      }
    };
  }, [columnEditStartHandler, rootRef]);

  return (
    <Fragment>
      <table css={tableStyle}>
        <thead>
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
        </thead>
        <tbody>
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
                  onColumnEditStart={columnEditStartHandler}
                  editFlags={{ relativeFlags, signalFlags }}
                />
              );
            })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </Fragment>
  );
}

export default RangesTable;

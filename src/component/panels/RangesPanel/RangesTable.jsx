/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { FaLink } from 'react-icons/fa';

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

const RangesTable = ({
  tableData,
  onChangeKind,
  onDelete,
  onUnlink,
  onZoom,
  onEdit,
  context,
  activeTab,
  preferences,
}) => {
  const element = activeTab && activeTab.replace(/[0-9]/g, '');
  const contextRef = useRef();
  const data = useMapRanges(tableData);
  const [relativeFlags, toggleResltiveColumn] = useToggleStatus(
    'id',
    tableData,
  );
  const { rootRef } = useGlobal();

  const isVisible = (key) => {
    return lodash.get(
      preferences,
      `formatting.panels.ranges.[${activeTab}].${key}`,
      false,
    );
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
    if (rootRef) {
      rootRef.addEventListener('mousedown', handleEditStart);
    }
    return () => {
      if (rootRef) {
        rootRef.removeEventListener('mousedown', handleEditStart);
      }
    };
  }, [editStartHander, rootRef]);

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
                  onRelativeColumnEditStart={editStartHander}
                  relativeFlags={relativeFlags}
                />
              );
            })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </Fragment>
  );
};

export default RangesTable;

import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { Fragment, useRef, useCallback } from 'react';
/** @jsx jsx */
import { useTable, useExpanded, useSortBy } from 'react-table';

import ContextMenu from '../ContextMenu';

import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTableExpandable = ({
  columns,
  data,
  renderRowSubComponent,
  context,
}) => {
  const contextRef = useRef();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useExpanded,
  );

  const contextMenuHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, row.original);
    },
    [contextRef],
  );

  return (
    <table {...getTableProps()} css={ReactTableStyle}>
      <ReactTableHeader headerGroups={headerGroups} />
      <tbody key={getTableBodyProps().key} {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Fragment key={row.index}>
              <ReactTableRow
                key={row.key}
                row={row}
                {...row.getRowProps()}
                onContextMenu={(e) => contextMenuHandler(e, row)}
              />
              {row.isExpanded ? (
                <tr>
                  <td colSpan={flatColumns.length}>
                    {row &&
                      row.original &&
                      row.original.id &&
                      renderRowSubComponent({ row })}
                  </td>
                </tr>
              ) : null}
              <ContextMenu ref={contextRef} context={context} />
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

ReactTableExpandable.defaultProps = {
  context: null,
  renderRowSubComponent: () => {
    return null;
  },
};

ReactTableExpandable.propTypes = {
  context: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ),
  renderRowSubComponent: PropTypes.func,
};

export default ReactTableExpandable;

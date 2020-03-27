/** @jsx jsx */
import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';
import { Fragment, useRef, useCallback } from 'react';
import { useTable, useSortBy } from 'react-table';

import ContextMenu from './ContextMenu';
import ReactTableHeader from './Elements/ReactTableHeader';
import ReactTableRow from './Elements/ReactTableRow';
import { ReactTableStyle } from './Style';

const ReactTable = ({ data, columns, context }) => {
  const contextRef = useRef();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
  );

  const contextMenuHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, row.original);
    },
    [contextRef],
  );
  return (
    <Fragment>
      <table {...getTableProps()} css={ReactTableStyle}>
        <ReactTableHeader headerGroups={headerGroups} />
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <ReactTableRow
                key={row.key}
                row={row}
                {...row.getRowProps()}
                onContextMenu={(e) => contextMenuHandler(e, row)}
              />
            );
          })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </Fragment>
  );
};
ReactTable.propTypes = {
  context: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ),
};
ReactTable.defaultProps = {
  context: null,
};

export default ReactTable;

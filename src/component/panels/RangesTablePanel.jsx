/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, useMemo } from 'react';
import { useTable, useExpanded } from 'react-table';
import { FaRegTrashAlt } from 'react-icons/fa';

import { DELETE_RANGE } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';

import NoTableData from './placeholder/NoTableData';

const style = css`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid #dedede;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.4rem;
      border-bottom: 1px solid #dedede;
      border-right: 1px solid #dedede;

      :last-child {
        border-right: 0;
      }

      .delete-button{
        background-color: transparent;
        border: none;
      }
     } 
    }
  }
`;

// A simple way to support a renderRowSubComponent is to make a render prop
// This is NOT part of the React Table API, it's merely a rendering
// option we are creating for ourselves in our table renderer
const Table = ({ columns: rangeColumns, data, renderRowSubComponent }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    flatColumns,
    state: { expanded },
  } = useTable(
    {
      columns: rangeColumns,
      data,
    },
    useExpanded, // We can useExpanded to track the expanded state
    // for sub components too!
  );

  return (
    <>
      <pre>
        <code>{JSON.stringify({ expanded }, null, 2)}</code>
      </pre>
      <table key={getTableProps().key} {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              key={headerGroup.getHeaderGroupProps().key}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headerGroup.headers.map((column) => (
                <th
                  key={column.getHeaderProps().key}
                  {...column.getHeaderProps()}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              // Use a React.Fragment here so the table markup is still valid
              <>
                <tr key={row.getRowProps().key} {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td
                        key={cell.getCellProps().key}
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
                {/*
                    If the row is in an expanded state, render a row with a
                    column that fills the entire length of the table.
                  */}
                {row.isExpanded ? (
                  <tr>
                    <td colSpan={flatColumns.length}>
                      {/*
                          Inside it, call our renderRowSubComponent function. In reality,
                          you could pass whatever you want as props to
                          a component like this, including the entire
                          table instance. But for this example, we'll just
                          pass the row
                        */}
                      {renderRowSubComponent({ row })}
                    </td>
                  </tr>
                ) : null}
              </>
            );
          })}
        </tbody>
      </table>
      <br />
    </>
  );
};

const RangesTablePanel = () => {
  let counter = 1;

  const { data: SpectrumsData, activeSpectrum } = useChartData();
  const dispatch = useDispatch();

  const deleteRangeHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_RANGE,
        data: { id: params.id },
      });
    },
    [dispatch],
  );

  const columns = [
    {
      // Make an expander cell
      Header: () => null, // No header
      id: 'expander', // It needs an ID
      Cell: ({ row }) => (
        // Use Cell to render an expander for each row.
        // We can use the getExpandedToggleProps prop-getter
        // to build the expander.
        <span {...row.getExpandedToggleProps()}>
          {row.isExpanded ? '\u25BC' : '\u25B6'}
        </span>
      ),
    },
    {
      Header: '#',
      Cell: () => counter++,
    },
    {
      Header: 'Range',
      columns: [
        {
          Header: 'From',
          accessor: 'from',
        },
        {
          Header: 'To',
          accessor: 'to',
        },
        {
          Header: 'Integral',
          accessor: 'integral',
        },
        {
          Header: 'ID',
          accessor: 'id',
        },
      ],
    },
    {
      Header: '',
      id: 'delete-button',
      Cell: ({ row }) => (
        <button
          type="button"
          className="delete-button"
          onClick={(e) => deleteRangeHandler(e, row)}
        >
          <FaRegTrashAlt />
        </button>
      ),
    },
  ];

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;

    if (_data && _data.ranges) {
      return _data.ranges.map((range) => {
        return {
          from: range.from,
          to: range.from,
          integral: range.integral,
          id: range.id,
          signals: range.signal,
        };
      });
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  // Create a function that will render our row sub components
  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <pre
        style={{
          fontSize: '10px',
        }}
      >
        <code>{JSON.stringify({ values: row.values })}</code>
      </pre>
    ),
    [],
  );

  return data && data.length > 0 ? (
    <div css={style}>
      <Table
        columns={columns}
        data={data}
        // We added this as a prop for our table component
        // Remember, this is not part of the React Table API,
        // it's merely a rendering option we created for
        // ourselves
        renderRowSubComponent={renderRowSubComponent}
      />
    </div>
  ) : (
    <NoTableData />
  );
};

export default RangesTablePanel;

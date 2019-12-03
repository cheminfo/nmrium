import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTable, useExpanded } from 'react-table';

import { useChartData } from '../context/ChartContext';

import NoTableData from './placeholder/NoTableData';

const Styles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
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
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
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
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              key={headerGroup.getHeaderGroupProps()}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headerGroup.headers.map((column) => (
                <th key={column.getHeaderProps()} {...column.getHeaderProps()}>
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
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td key={cell.getCellProps()} {...cell.getCellProps()}>
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
      <div>keys: {Object.keys(data['0'].signal['0'])}</div>
    </>
  );
};

const RangesTablePanel = () => {
  const { activeSpectrum, data } = useChartData();

  const columns = useMemo(
    () => [
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
        ],
      },
    ],
    [],
  );

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

  return activeSpectrum &&
    data &&
    data.find((d) => d.id === activeSpectrum.id && d.ranges) ? (
    <Styles>
      <Table
        columns={columns}
        data={data.filter((d) => d.id === activeSpectrum.id)[0].ranges}
        // We added this as a prop for our table component
        // Remember, this is not part of the React Table API,
        // it's merely a rendering option we created for
        // ourselves
        renderRowSubComponent={renderRowSubComponent}
      />
    </Styles>
  ) : (
    <NoTableData />
  );

  // return activeSpectrum &&
  //   data &&
  //   data.find((d) => d.id === activeSpectrum.id && d.ranges) ? (
  //   <>
  //     {/* <Table>
  //       <TableHead>
  //         <TableRow>
  //           <TableCell align="center">From</TableCell>
  //           <TableCell align="center">To</TableCell>
  //           <TableCell align="center">Integral</TableCell>
  //         </TableRow>
  //       </TableHead>
  //       <TableBody>
  //         {data
  //           .filter((d) => d.id === activeSpectrum.id) // && d.ranges)
  //           .map((d) =>
  //             d.ranges.map((range) => (
  //               <TableRow key={range.from + range.to + range.integral}>
  //                 <TableCell align="center">{range.from.toFixed(3)}</TableCell>
  //                 <TableCell align="center">{range.to.toFixed(3)}</TableCell>
  //                 <TableCell align="center">
  //                   {range.integral.toFixed(1)}
  //                 </TableCell>
  //               </TableRow>
  //             )),
  //           )}
  //       </TableBody>
  //     </Table> */}
  //   </>
  // ) : (
  //   <NoTableData />
  // );
};

export default RangesTablePanel;

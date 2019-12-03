/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useTable } from 'react-table';

const style = css`
    border-spacing: 0;
    border: 1px solid #dedede;
    width: 100%;
    font-size:12px;

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

     button{
        background-color: transparent;
        border: none;
    
     } 
`;

const Table = ({ data, columns }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  });
  return (
    <table {...getTableProps()} css={style}>
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
            <tr key={row.getRowProps().key} {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <td key={cell.getCellProps().key} {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;

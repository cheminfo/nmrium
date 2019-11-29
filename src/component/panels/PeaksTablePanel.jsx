/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useMemo } from 'react';
import { useTable } from 'react-table';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';

import NoTableData from './placeholder/NoTableData';

const style = css`
table {
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

     .delete-button{
        background-color: transparent;
        border: none;
    
     } 
    }
`;

const PeaksTablePanel = () => {
  let counter = 1;

  const { data: SpectrumsData, activeSpectrum } = useChartData();
  const dispatch = useDispatch();

  const deletePeakHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_PEAK_NOTATION,
        data: { id: params.id, xIndex: params.xIndex },
      });
    },
    [dispatch],
  );

  const columns = [
    {
      Header: '#',
      Cell: () => counter++,
    },

    {
      Header: 'peak index',
      accessor: 'xIndex',
    },
    {
      Header: 'Peak Value',
      accessor: 'value',
    },
    {
      Header: '',
      id: 'delete-button',
      Cell: ({ row }) => (
        <button
          type="button"
          className="delete-button"
          onClick={(e) => deletePeakHandler(e, row)}
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

    if (_data && _data.peaks) {
      const labelFraction = getPeakLabelNumberDecimals(_data.info.nucleus);
      return _data.peaks.map((peak) => {
        return {
          xIndex: peak.xIndex,
          value: _data.x[peak.xIndex].toFixed(labelFraction),
          id: _data.id,
        };
      });
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

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
    <div css={style}>
      {data && data.length > 0 ? (
        <table {...getTableProps()}>
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
                      <td
                        key={cell.getCellProps().key}
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <NoTableData />
      )}
    </div>
  );
};

export default PeaksTablePanel;

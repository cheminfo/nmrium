import React, { useContext, useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import ReactTable from '../elements/ReactTable/ReactTable';
import { ChartContext } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_INTEGRAL } from '../reducer/Actions';

import NoTableData from './placeholder/NoTableData';

const IntegralTablePanel = () => {
  const { activeSpectrum, data: SpectrumsData } = useContext(ChartContext);
  const dispatch = useDispatch();

  const deletePeakHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_INTEGRAL,
        integralID: params.id,
      });
    },
    [dispatch],
  );
  const columns = [
    {
      Header: '#',
      Cell: ({ row }) => row.index + 1,
      width: 10,
    },

    {
      Header: 'From',
      accessor: 'from',
      resizable: true,
      Cell: ({ row }) => row.original.from.toFixed(2),
    },
    {
      Header: 'To',
      accessor: 'to',
      resizable: true,
      Cell: ({ row }) => row.original.to.toFixed(2),
    },
    {
      Header: 'Value',
      accessor: 'value',
      resizable: true,
      Cell: ({ row }) => row.original.value.toFixed(2),
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
    if (_data && _data.integrals) {
      return _data.integrals;
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  return (
    <div>
      {data && data.length > 0 ? (
        <ReactTable data={data} columns={columns} />
      ) : (
        <NoTableData />
      )}
    </div>
  );
};

export default IntegralTablePanel;

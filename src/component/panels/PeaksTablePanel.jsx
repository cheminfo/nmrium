import React, { useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import Table from '../elements/Table';

import NoTableData from './placeholder/NoTableData';

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

  return (
    <div>
      {data && data.length > 0 ? (
        <Table data={data} columns={columns} />
      ) : (
        <NoTableData />
      )}
    </div>
  );
};

export default PeaksTablePanel;

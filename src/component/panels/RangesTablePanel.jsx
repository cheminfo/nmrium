import React, { useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { DELETE_RANGE } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ReactTableExpandable from '../elements/ReactTable/ReactTableExpandable';
import ReactTable from '../elements/ReactTable/ReactTable';

import NoTableData from './placeholder/NoTableData';

const RangesTablePanel = () => {
  const { data: SpectrumsData, activeSpectrum } = useChartData();
  const dispatch = useDispatch();

  const deleteRangeHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();
      const params = row.original;
      dispatch({
        type: DELETE_RANGE,
        rangeID: params.id,
      });
    },
    [dispatch],
  );

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;

    if (_data && _data.ranges) {
      return _data.ranges.map((range) => {
        return {
          from: range.from,
          to: range.to,
          integral: range.integral,
          id: range.id,
          signals: range.signal,
        };
      });
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  // define columns for different (sub)tables and expandable ones
  const columnsRanges = [
    {
      Header: () => null,
      id: 'expander',
      Cell: ({ row }) => (
        <span {...row.getExpandedToggleProps()}>
          {row.isExpanded ? '\u25BC' : '\u25B6'}
        </span>
      ),
    },
    {
      Header: '#',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'From',
      accessor: 'from',
      sortType: 'basic',
      Cell: ({ row }) => row.original.from.toFixed(2),
    },
    {
      Header: 'To',
      accessor: 'to',
      sortType: 'basic',
      Cell: ({ row }) => row.original.to.toFixed(2),
    },
    {
      Header: 'Integral',
      accessor: 'integral',
      sortType: 'basic',
      Cell: ({ row }) => row.original.integral.toFixed(1),
    },
    {
      Header: '#Signals',
      Cell: ({ row }) => row.original.signals.length,
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

  const columnsSignals = [
    {
      Header: 'Signals',
      columns: [
        {
          Header: '#',
          Cell: ({ row }) => row.index + 1,
        },
        {
          Header: 'Multiplicity',
          accessor: 'multiplicity',
        },
        {
          Header: '\u0394 (ppm)',
          accessor: 'delta',
          sortType: 'basic',
          Cell: ({ row }) => row.original.delta.toFixed(3),
        },
        {
          Header: '#Peaks',
          Cell: ({ row }) => row.original.peak.length,
        },
      ],
    },
  ];

  const columnsSignalsExpandable = [
    {
      Header: () => null,
      id: 'expanderSignals',
      Cell: ({ row }) => (
        <span {...row.getExpandedToggleProps()}>
          {row.isExpanded ? '\u25BC' : '\u25B6'}
        </span>
      ),
    },
    ...columnsSignals,
  ];

  const columnsCouplings = [
    {
      Header: 'Couplings',
      columns: [
        {
          Header: '#',
          Cell: ({ row }) => row.index + 1,
        },
        {
          Header: 'Multiplicity',
          accessor: 'multiplicity',
        },
        {
          Header: 'J (Hz)',
          accessor: 'coupling',
          sortType: 'basic',
          Cell: ({ row }) => row.original.coupling.toFixed(3),
        },
      ],
    },
  ];

  // render method for couplings sub-table
  const renderRowSubComponentCouplings = ({ row }) => {
    return row.original.j && row.original.j.length > 0 ? (
      <ReactTable data={row.original.j} columns={columnsCouplings} />
    ) : null;
  };

  // render method for signals sub-table; either expandable or not
  const renderRowSubComponentSignals = ({ row }) => {
    return row.original.signals &&
      row.original.signals.find((signal) => signal.j && signal.j.length > 0) ? (
      <ReactTableExpandable
        columns={columnsSignalsExpandable}
        data={row.original.signals}
        renderRowSubComponent={renderRowSubComponentCouplings}
      />
    ) : (
      <ReactTable columns={columnsSignals} data={row.original.signals} />
    );
  };

  return data && data.length > 0 ? (
    <div>
      <ReactTableExpandable
        columns={columnsRanges}
        data={data}
        renderRowSubComponent={renderRowSubComponentSignals}
      />
    </div>
  ) : (
    <NoTableData />
  );
};

export default RangesTablePanel;

import React, { useCallback, useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import ReactTable from '../elements/ReactTable/ReactTable';
import { useModal } from '../elements/Modal';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
};

const PeaksTablePanel = () => {
  const { data: SpectrumsData, activeSpectrum } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();

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
      Cell: ({ row }) => row.index + 1,
    },

    {
      Header: 'peak index',
      accessor: 'xIndex',
      sortType: 'basic',
    },
    {
      Header: 'δ (ppm)',
      accessor: 'value',
      sortType: 'basic',
    },
    {
      Header: 'Intensity ',
      accessor: 'yValue',
      sortType: 'basic',
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
          yValue: _data.y[peak.xIndex],
        };
      });
    } else {
      return [];
    }
  }, [SpectrumsData, activeSpectrum]);

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_PEAK_NOTATION, data: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted,Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  return (
    <div style={styles.container}>
      <DefaultPanelHeader
        onDelete={handleDeleteAll}
        counter={data && data.length}
        deleteToolTip="Delete All Peaks"
      />
      {data && data.length > 0 ? (
        <ReactTable data={data} columns={columns} />
      ) : (
        <NoTableData />
      )}
    </div>
  );
};

export default PeaksTablePanel;

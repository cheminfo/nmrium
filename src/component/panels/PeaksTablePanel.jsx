import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  FaRegTrashAlt,
  FaCog,
  FaArrowLeft,
  FaCheckCircle,
} from 'react-icons/fa';
import ReactCardFlip from 'react-card-flip';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import ReactTable from '../elements/ReactTable/ReactTable';
import { useModal } from '../elements/Modal';
import ToolTip from '../elements/ToolTip/ToolTip';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import PeaksPreferences from './preferences-panels/PeaksPreferences';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const PeaksTablePanel = () => {
  const { data: SpectrumsData, activeSpectrum } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

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

    if (_data && _data.peaks.values) {
      const labelFraction = getPeakLabelNumberDecimals(_data.info.nucleus);
      return _data.peaks.values.map((peak) => {
        return {
          xIndex: peak.xIndex,
          value: _data.x[peak.xIndex].toFixed(labelFraction),
          id: peak.id,
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

  const showSettingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
  }, []);

  return (
    <div style={styles.container}>
      <DefaultPanelHeader
        onDelete={handleDeleteAll}
        counter={data && data.length}
        deleteToolTip="Delete All Peaks"
      >
        <ToolTip
          title={isFlipped ? 'back to peaks List Panel' : 'peaks preferences'}
          popupPlacement="right"
        >
          <button
            style={styles.button}
            type="button"
            onClick={showSettingsPanelHandler}
          >
            {isFlipped ? <FaArrowLeft /> : <FaCog />}
          </button>
        </ToolTip>
        {isFlipped && (
          <ToolTip title="Save Setting" popupPlacement="right">
            <button
              style={styles.button}
              type="button"
              onClick={saveSettingHandler}
            >
              <FaCheckCircle />
            </button>
          </ToolTip>
        )}
      </DefaultPanelHeader>
      <ReactCardFlip
        isFlipped={isFlipped}
        infinite={true}
        containerStyle={{ height: '100%' }}
      >
        <div style={isFlipped ? { display: 'none' } : {}}>
          {data && data.length > 0 ? (
            <ReactTable data={data} columns={columns} />
          ) : (
            <NoTableData />
          )}
        </div>
        <PeaksPreferences data={SpectrumsData} ref={settingRef} />
      </ReactCardFlip>
    </div>
  );
};

export default PeaksTablePanel;

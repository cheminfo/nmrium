import React, { useCallback, useMemo, useState, useRef } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import ReactCardFlip from 'react-card-flip';
import lodash from 'lodash';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import ReactTable from '../elements/ReactTable/ReactTable';
import { useModal } from '../elements/Modal';
import formatNumber from '../utility/FormatNumber';

import NoTableData from './placeholder/NoTableData';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import PreferencesHeader from './header/PreferencesHeader';
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
  const {
    data: SpectrumsData,
    activeSpectrum,
    preferences,
    activeTab,
  } = useChartData();
  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const [isTableVisible, setTableVisibility] = useState(true);
  const settingRef = useRef();

  const defaultColumns = [
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

  const setCustomColumn = (array, index, columnLabel, cellHandler) => {
    array.splice(index, 0, {
      Header: columnLabel,
      sortType: 'basic',
      Cell: ({ row }) => cellHandler(row),
    });
  };

  const tableColumns = useMemo(() => {
    const peaksPreferences = lodash.get(
      preferences,
      `panels.peaks.[${activeTab}]`,
    );
    if (peaksPreferences) {
      let cols = [...defaultColumns];
      if (peaksPreferences.PPMShow) {
        setCustomColumn(cols, 2, 'δ (ppm)', (row) =>
          formatNumber(row.original.value, peaksPreferences.PPMFormat),
        );
      }
      return cols;
    }
    return defaultColumns;
  }, [activeTab, defaultColumns, preferences]);

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

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      setTimeout(
        () => {
          setTableVisibility(false);
        },
        400,
        isFlipped,
      );
    } else {
      setTableVisibility(true);
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          onDelete={handleDeleteAll}
          counter={data && data.length}
          deleteToolTip="Delete All Peaks"
          showSettingButton="true"
          onSettingClick={settingsPanelHandler}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}

      <ReactCardFlip
        isFlipped={isFlipped}
        infinite={true}
        containerStyle={{ height: '100%' }}
      >
        <div style={!isTableVisible ? { display: 'none' } : {}}>
          {data && data.length > 0 ? (
            <ReactTable data={data} columns={tableColumns} />
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

import React, { useCallback, useMemo, useState, useRef, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import ReactCardFlip from 'react-card-flip';
import lodash from 'lodash';

import { useChartData } from '../context/ChartContext';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { DELETE_PEAK_NOTATION } from '../reducer/types/Types';
import { useDispatch } from '../context/DispatchContext';
import ReactTable from '../elements/ReactTable/ReactTable';
import { useModal } from '../elements/Modal';
import formatNumber from '../utility/FormatNumber';
import ConnectToContext from '../hoc/ConnectToContext';

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

const PeaksTablePanel = memo(
  ({ data: SpectrumsData, activeSpectrum, preferences, activeTab }) => {
    // const {
    // data: SpectrumsData,
    // activeSpectrum,
    // preferences,
    // activeTab,
    // } = useChartData();

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

    const initialColumns = [
      {
        index: 20,
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

    const tableColumns = useMemo(() => {
      const setCustomColumn = (array, index, columnLabel, cellHandler) => {
        array.push({
          index: index,
          Header: columnLabel,
          sortType: 'basic',
          Cell: ({ row }) => cellHandler(row),
        });
      };

      const peaksPreferences = lodash.get(
        preferences,
        `panels.peaks.[${activeTab}]`,
      );
      if (peaksPreferences) {
        let cols = [...initialColumns];
        if (peaksPreferences.showPeakNumber) {
          setCustomColumn(cols, 1, '#', (row) =>
            formatNumber(row.index + 1, peaksPreferences.peakNumberFormat),
          );
        }
        if (peaksPreferences.showPeakIndex) {
          setCustomColumn(cols, 2, 'index', (row) =>
            formatNumber(row.original.xIndex, peaksPreferences.peakIndexFormat),
          );
        }
        if (peaksPreferences.showDeltaPPM) {
          setCustomColumn(cols, 3, 'δ (ppm)', (row) =>
            formatNumber(row.original.value, peaksPreferences.deltaPPMFormat),
          );
        }
        if (peaksPreferences.showDeltaHz) {
          setCustomColumn(cols, 4, 'δ (Hz)', (row) =>
            formatNumber(row.original.value, peaksPreferences.deltaHzFormat),
          );
        }
        if (peaksPreferences.showIntensity) {
          setCustomColumn(cols, 5, 'Intensity', (row) =>
            formatNumber(row.original.yValue, peaksPreferences.intensityFormat),
          );
        }
        if (peaksPreferences.showPeakWidth) {
          setCustomColumn(cols, 5, 'Peak Width', (row) =>
            formatNumber(
              row.original.peakWidth,
              peaksPreferences.peakWidthFormat,
            ),
          );
        }
        return cols.sort((object1, object2) => object1.index - object2.index);
      } else {
        return defaultColumns;
      }
    }, [activeTab, defaultColumns, initialColumns, preferences]);

    const data = useMemo(() => {
      const _data =
        activeSpectrum && SpectrumsData
          ? SpectrumsData[activeSpectrum.index]
          : null;

      if (_data && _data.peaks && _data.peaks.values) {
        const labelFraction = getPeakLabelNumberDecimals(_data.info.nucleus);
        return _data.peaks.values.map((peak) => {
          return {
            xIndex: peak.xIndex,
            value: _data.x[peak.xIndex].toFixed(labelFraction),
            id: peak.id,
            yValue: _data.y[peak.xIndex],
            peakWidth: peak.width ? peak.width : '',
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
      setTableVisibility(true);
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
  },
);

export default ConnectToContext(PeaksTablePanel, useChartData);

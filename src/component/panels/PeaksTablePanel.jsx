import React, { useCallback, useMemo, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';
import { FaRegTrashAlt } from 'react-icons/fa';

import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useModal } from '../elements/Modal';
import ReactTable from '../elements/ReactTable/ReactTable';
import ConnectToContext from '../hoc/ConnectToContext';
import { DELETE_PEAK_NOTATION } from '../reducer/types/Types';
import formatNumber from '../utility/FormatNumber';
import { GetPreference } from '../utility/PreferencesHelper';

import DefaultPanelHeader from './header/DefaultPanelHeader';
import PreferencesHeader from './header/PreferencesHeader';
import NoTableData from './placeholder/NoTableData';
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
    const { xDomain } = useChartData();
    const [filterIsActive, setFilterIsActive] = useState(false);
    const [peaksCounter, setPeaksCounter] = useState(0);

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

      const peaksPreferences = GetPreference(
        preferences,
        `peaks.[${activeTab}]`,
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

      function isInRange(value) {
        const factor = 100000;
        return (
          value * factor >= xDomain[0] * factor &&
          value * factor <= xDomain[1] * factor
        );
      }

      if (_data && _data.peaks && _data.peaks.values) {
        setPeaksCounter(_data.peaks.values.length);

        const labelFraction = getPeakLabelNumberDecimals(_data.info.nucleus);

        const peaks = filterIsActive
          ? _data.peaks.values.filter((peak) => isInRange(_data.x[peak.xIndex]))
          : _data.peaks.values;

        return peaks.map((peak) => {
          const value = _data.x[peak.xIndex].toFixed(labelFraction);
          return {
            xIndex: peak.xIndex,
            value: value,
            id: peak.id,
            yValue: _data.y[peak.xIndex],
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        });
      }
      // return [];
    }, [SpectrumsData, activeSpectrum, filterIsActive, xDomain]);

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

    const handleOnFilter = useCallback(() => {
      setFilterIsActive(!filterIsActive);
    }, [filterIsActive]);

    return (
      <div style={styles.container}>
        {!isFlipped && (
          <DefaultPanelHeader
            counter={peaksCounter}
            onDelete={handleDeleteAll}
            deleteToolTip="Delete All Peaks"
            onFilter={handleOnFilter}
            filterToolTip={
              filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
            }
            filterIsActive={filterIsActive}
            counterFiltered={data && data.length}
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

import React, { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { getPeakLabelNumberDecimals } from '../../../data/defaults/default';
import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import ContextWrapper from '../../hoc/ContextWrapper';
import { DELETE_PEAK_NOTATION } from '../../reducer/types/Types';
import formatNumber from '../../utility/FormatNumber';
import { GetPreference } from '../../utility/PreferencesHelper';
import NoTableData from '../extra/placeholder/NoTableData';

const PeaksTable = memo(
  ({ xDomain, preferences, activeTab, data, enableFilter, onPeaksChange }) => {
    const dispatch = useDispatch();

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
            formatNumber(row.original.valueHz, peaksPreferences.deltaHzFormat),
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

    const _data = useMemo(() => {
      function isInRange(value) {
        const factor = 100000;
        return (
          value * factor >= xDomain[0] * factor &&
          value * factor <= xDomain[1] * factor
        );
      }

      if (data && data.peaks && data.peaks.values) {
        const labelFraction = getPeakLabelNumberDecimals(data.info.nucleus);

        const peaks = enableFilter
          ? data.peaks.values.filter((peak) => isInRange(data.x[peak.xIndex]))
          : data.peaks.values;

        onPeaksChange(peaks);

        return peaks.map((peak) => {
          const value = data.x[peak.xIndex].toFixed(labelFraction);
          return {
            xIndex: peak.xIndex,
            value: value,
            valueHz:
              data.info && data.info.originFrequency
                ? value * data.info.originFrequency
                : '',
            id: peak.id,
            yValue: data.y[peak.xIndex],
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        });
      }
    }, [data, enableFilter, onPeaksChange, xDomain]);

    return _data && _data.length > 0 ? (
      <ReactTable data={_data} columns={tableColumns} />
    ) : (
      <NoTableData />
    );
  },
);

export default ContextWrapper(PeaksTable, 'peaks', 'info', 'x', 'y');

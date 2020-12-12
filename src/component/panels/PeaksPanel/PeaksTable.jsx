import { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import PeaksWrapper from '../../hoc/PeaksWrapper';
import { DELETE_PEAK_NOTATION } from '../../reducer/types/Types';
import formatNumber, {
  useFormatNumberByNucleus,
} from '../../utility/FormatNumber';
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';

const PeaksTable = memo(
  ({
    peaks,
    info,
    x,
    y,
    xDomain,
    activeTab,
    enableFilter,
    onPeaksChange,
    preferences,
  }) => {
    const dispatch = useDispatch();
    const format = useFormatNumberByNucleus(info.nucleus);
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

    const defaultColumns = useMemo(
      () => [
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
      ],
      [deletePeakHandler],
    );

    const initialColumns = useMemo(
      () => [
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
      ],
      [deletePeakHandler],
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

      const peaksPreferences = getValue(
        preferences,
        `formatting.panels.peaks.[${activeTab}]`,
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
      if (peaks && peaks.values) {
        const _peaks = enableFilter
          ? peaks.values.filter((peak) => isInRange(x[peak.xIndex]))
          : peaks.values;

        onPeaksChange(_peaks);

        return _peaks.map((peak) => {
          const value = format(x[peak.xIndex]);
          return {
            xIndex: peak.xIndex,
            value: value,
            valueHz:
              info && info.originFrequency ? value * info.originFrequency : '',
            id: peak.id,
            yValue: y[peak.xIndex],
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        });
      }
    }, [enableFilter, format, info, onPeaksChange, peaks, x, xDomain, y]);

    return _data && _data.length > 0 ? (
      <ReactTable data={_data} columns={tableColumns} />
    ) : (
      <NoTableData />
    );
  },
);

export default PeaksWrapper(PeaksTable);
// export default ContextWrapper(
//   PeaksTable,
//   ['spectrum', 'xDomain', 'preferences', 'activeTab'],
//   { spectrum: ['peaks', 'info', 'x', 'y'] },
// );

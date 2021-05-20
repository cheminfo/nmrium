import { useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import PeaksWrapper from '../../hoc/PeaksWrapper';
import {
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
} from '../../reducer/types/Types';
import formatNumber, {
  useFormatNumberByNucleus,
} from '../../utility/FormatNumber';
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';
import { peaksDefaultValues } from '../extra/preferences/defaultValues';

function PeaksTable({
  peaks,
  info,
  xDomain,
  activeTab,
  enableFilter,
  onFilter,
  preferences,
}) {
  const dispatch = useDispatch();
  const deltaPPMRefs = useRef([]);
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

  const initialColumns = useMemo(
    () => [
      {
        index: 20,
        Header: '',
        width: '1%',
        maxWidth: '24px',
        minWidth: '24px',
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

  const editStartHander = useCallback((index) => {
    deltaPPMRefs.current.forEach((ref, i) => {
      if (index !== i && ref) {
        ref.closeEdit();
      }
    });
  }, []);

  const saveDeltaPPMRefsHandler = useCallback(
    (event, row) => {
      const shiftValue = parseFloat(event.target.value) - parseFloat(row.value);
      dispatch({ type: SHIFT_SPECTRUM, shiftValue });
    },
    [dispatch],
  );

  const tableColumns = useMemo(() => {
    const setCustomColumn = (
      array,
      index,
      columnLabel,
      extraParams,
      sortType = 'basic',
    ) => {
      array.push({
        ...extraParams,
        index: index,
        Header: columnLabel,
        sortType,
      });
    };

    const peaksPreferences = getValue(
      preferences,
      `formatting.panels.peaks.[${activeTab}]`,
      peaksDefaultValues,
    );

    let cols = [...initialColumns];
    if (peaksPreferences.showPeakNumber) {
      setCustomColumn(cols, 1, '#', {
        Cell: ({ row }) => row.index + 1,
        width: '1%',
        maxWidth: '40px',
        minWidth: '40px',
      });
    }
    if (peaksPreferences.showPeakIndex) {
      setCustomColumn(cols, 2, 'index', {
        accessor: (row) =>
          formatNumber(row.xIndex, peaksPreferences.peakIndexFormat),
      });
    }
    if (peaksPreferences.showDeltaPPM) {
      setCustomColumn(cols, 3, 'δ (ppm)', {
        accessor: (row) =>
          formatNumber(row.value, peaksPreferences.deltaPPMFormat),
        Cell: ({ row }) => (
          <EditableColumn
            onEditStart={() => editStartHander(row.index)}
            ref={(ref) => (deltaPPMRefs.current[row.index] = ref)}
            value={formatNumber(
              row.original.value,
              peaksPreferences.deltaPPMFormat,
            )}
            onSave={(event) => saveDeltaPPMRefsHandler(event, row.original)}
            type="number"
          />
        ),
      });
    }
    if (peaksPreferences.showDeltaHz) {
      setCustomColumn(cols, 4, 'δ (Hz)', {
        accessor: (row) =>
          formatNumber(row.valueHz, peaksPreferences.deltaHzFormat),
      });
    }
    if (peaksPreferences.showIntensity) {
      setCustomColumn(cols, 5, 'Intensity', {
        accessor: (row) =>
          formatNumber(row.intensity, peaksPreferences.intensityFormat),
      });
    }
    if (peaksPreferences.showPeakWidth) {
      setCustomColumn(cols, 5, 'Peak Width', {
        accessor: (row) =>
          formatNumber(row.peakWidth, peaksPreferences.peakWidthFormat),
      });
    }
    return cols.sort((object1, object2) => object1.index - object2.index);
  }, [
    activeTab,
    editStartHander,
    initialColumns,
    preferences,
    saveDeltaPPMRefsHandler,
  ]);

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
        ? peaks.values.filter((peak) => isInRange(peak.delta))
        : peaks.values;

      return _peaks
        .map((peak) => {
          const value = format(peak.delta);
          return {
            value: value,
            valueHz:
              info && info.originFrequency ? value * info.originFrequency : '',
            id: peak.id,
            intensity: peak.intensity,
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        })
        .sort((prev, next) => prev.value - next.value);
    }

    return [];
  }, [enableFilter, format, info, peaks, xDomain]);

  useEffect(() => {
    onFilter(_data.length);
  }, [_data, onFilter]);

  return _data && _data.length > 0 ? (
    <ReactTable data={_data} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
}

export default PeaksWrapper(memo(PeaksTable));

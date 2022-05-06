import { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
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

interface PeaksTableProps {
  activeTab: string;
  preferences: any;
  data: any;
  info: {
    nucleus: string;
  };
}

function PeaksTable({ activeTab, preferences, data, info }: PeaksTableProps) {
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

  const peaksPreferences = useMemo(
    () =>
      getValue(
        preferences.current,
        `formatting.panels.peaks.[${activeTab}]`,
        peaksDefaultValues,
      ),
    [activeTab, preferences],
  );

  const saveDeltaPPMRefsHandler = useCallback(
    (event, row) => {
      const shiftValue = parseFloat(event.target.value) - parseFloat(row.value);
      dispatch({ type: SHIFT_SPECTRUM, shiftValue });
    },
    [dispatch],
  );
  const COLUMNS: (CustomColumn & { showWhen: string })[] = useMemo(
    () => [
      {
        showWhen: 'showPeakNumber',
        index: 1,
        Header: '#',
        Cell: ({ row }) => row.index + 1,
        style: { width: '1%', maxWidth: '40px', minWidth: '40px' },
      },
      {
        showWhen: 'showPeakIndex',
        index: 2,
        Header: 'index',
        accessor: (row) =>
          formatNumber(row.xIndex, peaksPreferences.peakIndexFormat),
      },
      {
        showWhen: 'showDeltaPPM',
        index: 3,
        Header: 'δ (ppm)',
        accessor: (row) => format(row.value),
        Cell: ({ row }) => (
          <EditableColumn
            value={format(row.original.value)}
            onSave={(event) => saveDeltaPPMRefsHandler(event, row.original)}
            type="number"
          />
        ),
      },
      {
        showWhen: 'showDeltaHz',
        index: 4,
        Header: 'δ (Hz)',
        accessor: (row) =>
          formatNumber(row.valueHz, peaksPreferences.deltaHzFormat),
      },
      {
        showWhen: 'showIntensity',
        index: 5,
        Header: 'Intensity',
        style: { maxWidth: '80px' },
        accessor: (row) =>
          formatNumber(row.intensity, peaksPreferences.intensityFormat),
      },
      {
        showWhen: 'showPeakWidth',
        index: 6,
        Header: 'Width (Hz)',
        accessor: (row) =>
          formatNumber(row.peakWidth, peaksPreferences.peakWidthFormat),
      },
    ],
    [format, peaksPreferences, saveDeltaPPMRefsHandler],
  );

  const initialColumns: CustomColumn[] = useMemo(
    () => [
      {
        index: 20,
        Header: '',
        style: {
          width: '1%',
          maxWidth: '24px',
          minWidth: '24px',
        },
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
    let columns = [...initialColumns];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (peaksPreferences[showWhen]) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [COLUMNS, initialColumns, peaksPreferences]);

  return data && data.length > 0 ? (
    <ReactTable
      data={data}
      columns={tableColumns}
      approxItemHeight={20}
      enableVirtualScroll
    />
  ) : (
    <NoTableData />
  );
}

export default memo(PeaksTable);

import { useCallback, useMemo, memo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import {
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
} from '../../reducer/types/Types';
import { formatNumber } from '../../utility/formatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

interface PeaksTableProps {
  activeTab: string;
  data: any;
}

function PeaksTable({ activeTab, data }: PeaksTableProps) {
  const dispatch = useDispatch();

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
  const peaksPreferences = usePanelPreferences('peaks', activeTab);

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
        showWhen: 'showDeltaPPM',
        index: 3,
        Header: 'δ (ppm)',
        accessor: (row) =>
          formatNumber(row.value, peaksPreferences.deltaPPMFormat),
        Cell: ({ row }) => (
          <EditableColumn
            value={formatNumber(
              row.original.value,
              peaksPreferences.deltaPPMFormat,
            )}
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
    [peaksPreferences, saveDeltaPPMRefsHandler],
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

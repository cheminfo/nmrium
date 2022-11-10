import lodashGet from 'lodash/get';
import { useCallback, useMemo, memo } from 'react';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { useModal } from '../../elements/popup/Modal';
import { positions, transitions } from '../../elements/popup/options';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import EditPeakShapeModal from '../../modal/EditPeakShapeModal';
import {
  DELETE_PEAK_NOTATION,
  SHIFT_SPECTRUM,
} from '../../reducer/types/Types';
import { formatNumber } from '../../utility/formatNumber';
import NoTableData from '../extra/placeholder/NoTableData';

import { PeakRecord } from './PeaksPanel';

interface PeaksTableProps {
  activeTab: string;
  data: any;
}

function PeaksTable({ activeTab, data }: PeaksTableProps) {
  const dispatch = useDispatch();
  const modal = useModal();
  const peaksPreferences = usePanelPreferences('peaks', activeTab);

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
  const editPeakHandler = useCallback(
    (e, row) => {
      e.preventDefault();
      e.stopPropagation();

      modal.show(
        <EditPeakShapeModal
          peak={row.original}
          peaksPreferences={peaksPreferences}
        />,
        {
          position: positions.MIDDLE_RIGHT,
          transition: transitions.SCALE,
          isBackgroundBlur: false,
        },
      );
    },
    [modal, peaksPreferences],
  );

  const saveDeltaPPMRefsHandler = useCallback(
    (event, row) => {
      const shiftValue =
        Number.parseFloat(event.target.value) - Number.parseFloat(row.x);
      dispatch({ type: SHIFT_SPECTRUM, shiftValue });
    },
    [dispatch],
  );
  const COLUMNS: (CustomColumn<PeakRecord> & { showWhen: string })[] = useMemo(
    () => [
      {
        showWhen: 'peakNumber.show',
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
        style: { width: '1%', maxWidth: '40px', minWidth: '40px' },
      },
      {
        showWhen: 'deltaPPM.show',
        index: 3,
        Header: 'δ (ppm)',
        accessor: (row) =>
          formatNumber(row.x, peaksPreferences.deltaPPM.format),
        Cell: ({ row }) => (
          <EditableColumn
            value={formatNumber(
              row.original.x,
              peaksPreferences.deltaPPM.format,
            )}
            onSave={(event) => saveDeltaPPMRefsHandler(event, row.original)}
            type="number"
          />
        ),
      },
      {
        showWhen: 'deltaHz.show',
        index: 4,
        Header: 'δ (Hz)',
        accessor: (row) =>
          formatNumber(row.xHz, peaksPreferences.deltaHz.format),
      },
      {
        showWhen: 'intensity.show',
        index: 5,
        Header: 'Intensity',
        style: { maxWidth: '80px' },
        accessor: (row) =>
          formatNumber(row.y, peaksPreferences.intensity.format),
      },
      {
        showWhen: 'peakWidth.show',
        index: 6,
        Header: 'Width (Hz)',
        accessor: (row) =>
          formatNumber(row.width, peaksPreferences.peakWidth.format),
      },
      {
        showWhen: 'showKind',
        index: 7,
        Header: 'Kind',
        accessor: (row) => row.shape?.kind || '',
      },
      {
        showWhen: 'fwhm.show',
        index: 8,
        Header: 'fwhm',
        accessor: (row) => {
          if (row?.shape?.fwhm) {
            return formatNumber(row.shape.fwhm, peaksPreferences.fwhm.format);
          }
          return '';
        },
      },
      {
        showWhen: 'mu.show',
        index: 9,
        Header: 'mu',
        accessor: (row) => {
          if (row?.shape?.kind === 'pseudoVoigt' && row?.shape?.mu) {
            return formatNumber(row.shape.mu, peaksPreferences.mu.format);
          }
          return '';
        },
      },
    ],
    [peaksPreferences, saveDeltaPPMRefsHandler],
  );

  const initialColumns: CustomColumn<any>[] = useMemo(
    () => [
      {
        index: 20,
        Header: '',
        style: {
          width: '1%',
          maxWidth: '48px',
          minWidth: '48px',
        },
        id: 'actions',
        Cell: ({ row }) => (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button
              type="button"
              className="edit-button"
              onClick={(e) => editPeakHandler(e, row)}
            >
              <FaEdit />
            </button>
            <button
              type="button"
              className="delete-button"
              onClick={(e) => deletePeakHandler(e, row)}
            >
              <FaRegTrashAlt />
            </button>
          </div>
        ),
      },
    ],
    [deletePeakHandler, editPeakHandler],
  );

  const tableColumns = useMemo(() => {
    let columns = [...initialColumns];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (lodashGet(peaksPreferences, showWhen)) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [COLUMNS, initialColumns, peaksPreferences]);

  return data && data.length > 0 ? (
    <ReactTable
      data={data}
      columns={tableColumns}
      approxItemHeight={24}
      enableVirtualScroll
    />
  ) : (
    <NoTableData />
  );
}

export default memo(PeaksTable);

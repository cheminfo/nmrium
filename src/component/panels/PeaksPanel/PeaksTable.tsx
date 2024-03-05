import lodashGet from 'lodash/get';
import { Info1D } from 'nmr-processing';
import { useCallback, useMemo, memo } from 'react';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import EditableColumn from '../../elements/EditableColumn';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  ControlCustomColumn,
  createActionColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { useModal } from '../../elements/popup/Modal';
import { positions, transitions } from '../../elements/popup/options';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import EditPeakShapeModal from '../../modal/EditPeakShapeModal';
import { formatNumber } from '../../utility/formatNumber';
import NoDataForFid from '../extra/placeholder/NoDataForFid';
import NoTableData from '../extra/placeholder/NoTableData';

import { PeakRecord } from './PeaksPanel';

interface PeaksTableProps {
  activeTab: string;
  data: PeakRecord[];
  info: Info1D;
}

function handleActiveRow(row) {
  return row.original.isConstantlyHighlighted;
}

function PeaksTable({ activeTab, data, info }: PeaksTableProps) {
  const dispatch = useDispatch();
  const modal = useModal();
  const peaksPreferences = usePanelPreferences('peaks', activeTab);

  const deletePeakHandler = useCallback(
    (row) => {
      const params = row.original;
      dispatch({
        type: 'DELETE_PEAK',
        payload: { id: params.id },
      });
    },
    [dispatch],
  );
  const editPeakHandler = useCallback(
    (row) => {
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
      const shift =
        Number.parseFloat(event.target.value) - Number.parseFloat(row.x);
      dispatch({ type: 'SHIFT_SPECTRUM', payload: { shift } });
    },
    [dispatch],
  );
  const COLUMNS: Array<ControlCustomColumn<PeakRecord>> = useMemo(
    () => [
      {
        showWhen: 'showSerialNumber',
        index: 1,
        Header: '#',
        accessor: (_, index) => index + 1,
        style: { width: '1%', maxWidth: '40px', minWidth: '40px' },
      },
      {
        showWhen: 'deltaPPM.show',
        index: 3,
        Header: 'δ (ppm)',
        accessor: 'x',
        Cell: ({ row }) => (
          <EditableColumn
            value={formatNumber(
              row.original.x,
              peaksPreferences.deltaPPM.format,
            )}
            onSave={(event) => saveDeltaPPMRefsHandler(event, row.original)}
            type="number"
            validate={(val) => val !== ''}
          />
        ),
      },
      {
        showWhen: 'deltaHz.show',
        index: 4,
        Header: 'δ (Hz)',
        accessor: 'xHz',
        Cell: ({ row }) =>
          formatNumber(row.original.xHz, peaksPreferences.deltaHz.format),
      },
      {
        showWhen: 'intensity.show',
        index: 5,
        Header: 'Intensity',
        style: { maxWidth: '80px' },
        accessor: 'y',
        Cell: ({ row }) =>
          formatNumber(row.original.y, peaksPreferences.intensity.format),
      },
      {
        showWhen: 'peakWidth.show',
        index: 6,
        Header: 'Width (Hz)',
        accessor: 'width',
        Cell: ({ row }) =>
          formatNumber(row.original.width, peaksPreferences.peakWidth.format),
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
        accessor: (row) => row?.shape?.fwhm || '',
        Cell: ({ row }) => {
          const fwhm = row.original?.shape?.fwhm;
          if (fwhm) {
            return formatNumber(fwhm, peaksPreferences.fwhm.format);
          }
          return '';
        },
      },
      {
        showWhen: 'mu.show',
        index: 9,
        Header: 'mu',
        accessor: (row) =>
          (row?.shape?.kind === 'pseudoVoigt' && row?.shape?.mu) || '',
        Cell: ({ row }) => {
          const mu =
            row.original?.shape?.kind === 'pseudoVoigt' &&
            row.original?.shape?.mu;
          if (mu) {
            return formatNumber(mu, peaksPreferences.mu.format);
          }
          return '';
        },
      },
      {
        showWhen: 'showEditPeakShapeAction',
        ...createActionColumn<PeakRecord>({
          index: 20,
          icon: <FaEdit />,
          onClick: editPeakHandler,
          style: {
            borderRight: '0px',
          },
        }),
      },
      {
        showWhen: 'showDeleteAction',
        ...createActionColumn<PeakRecord>({
          index: 21,
          icon: <FaRegTrashAlt />,
          onClick: deletePeakHandler,
        }),
      },
    ],
    [
      peaksPreferences,
      saveDeltaPPMRefsHandler,
      deletePeakHandler,
      editPeakHandler,
    ],
  );

  const tableColumns = useMemo(() => {
    const columns: Array<ControlCustomColumn<PeakRecord>> = [];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (lodashGet(peaksPreferences, showWhen)) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [COLUMNS, peaksPreferences]);

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (!data || data.length === 0) {
    return <NoTableData />;
  }

  return (
    <ReactTable
      activeRow={handleActiveRow}
      rowStyle={{ activated: { backgroundColor: '#f5f5dc' } }}
      data={data}
      columns={tableColumns}
      approxItemHeight={24}
      enableVirtualScroll
    />
  );
}

export default memo(PeaksTable);

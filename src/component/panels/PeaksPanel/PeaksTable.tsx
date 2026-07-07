import type { Info1D, Peak1D } from '@zakodium/nmr-types';
import dlv from 'dlv';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext.js';
import { EditableColumn } from '../../elements/EditableColumn.js';
import { EmptyText } from '../../elements/EmptyText.js';
import type { TanStackTableColumn } from '../../elements/TanStackTable/TanStackTable.js';
import TanStackTable from '../../elements/TanStackTable/TanStackTable.js';
import type { ControlCustomColumn } from '../../elements/TanStackTable/utility/addCustomColumn.js';
import {
  createActionColumn,
  getTableColumns,
} from '../../elements/TanStackTable/utility/addCustomColumn.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { formatNumber } from '../../utility/formatNumber.js';
import { NoDataForFid } from '../extra/placeholder/NoDataForFid.js';

import type { PeakRecord } from './PeaksPanel.js';

export function usePeaksTableColumns(activeTab: string) {
  const dispatch = useDispatch();
  const { tablePreferences } = usePanelPreferences('peaks', activeTab);
  const [peak, setEditedPeak] = useState<Peak1D | undefined>();

  const deletePeakHandler = useCallback(
    (params: PeakRecord) => {
      dispatch({
        type: 'DELETE_PEAK',
        payload: { id: params.id },
      });
    },
    [dispatch],
  );

  const editPeakHandler = useCallback((row: PeakRecord) => {
    setEditedPeak(row);
  }, []);

  const saveDeltaPPMRefsHandler = useCallback(
    (value: string | number, peak: PeakRecord) => {
      const shift = Number(value) - peak.x;
      dispatch({ type: 'SHIFT_SPECTRUM', payload: { shift } });
    },
    [dispatch],
  );

  const COLUMNS = useMemo<Array<ControlCustomColumn<PeakRecord>>>(
    () => [
      {
        showWhen: 'showSerialNumber',
        index: 1,
        header: '#',
        accessorFn: (_, index) => index + 1,
        meta: { style: { width: '1%', maxWidth: '40px', minWidth: '40px' } },
      },
      {
        showWhen: 'deltaPPM.show',
        index: 3,
        header: 'δ (ppm)',
        accessorKey: 'x',
        cell: ({ row }) => (
          <EditableColumn
            value={formatNumber(
              row.original.x,
              tablePreferences.deltaPPM.format,
            )}
            onSave={(value) => saveDeltaPPMRefsHandler(value, row.original)}
            type="number"
            validate={(val) => val !== ''}
          />
        ),
      },
      {
        showWhen: 'deltaHz.show',
        index: 4,
        header: 'δ (Hz)',
        accessorKey: 'xHz',
        cell: ({ row }) =>
          formatNumber(row.original.xHz, tablePreferences.deltaHz.format),
      },
      {
        showWhen: 'intensity.show',
        index: 5,
        header: 'Intensity',
        meta: { style: { maxWidth: '80px' } },
        accessorKey: 'y',
        cell: ({ row }) =>
          formatNumber(row.original.y, tablePreferences.intensity.format),
      },
      {
        showWhen: 'peakWidth.show',
        index: 6,
        header: 'Width (Hz)',
        accessorKey: 'width',
        cell: ({ row }) =>
          formatNumber(row.original.width, tablePreferences.peakWidth.format),
      },
      {
        showWhen: 'showKind',
        index: 7,
        header: 'Kind',
        accessorFn: (row) => row.shape?.kind || '',
      },
      {
        showWhen: 'fwhm.show',
        index: 8,
        header: 'fwhm',
        accessorFn: (row) => row?.shape?.fwhm || '',
        cell: ({ row }) => {
          const fwhm = row.original?.shape?.fwhm;
          if (typeof fwhm !== 'number') {
            return '';
          }
          return formatNumber(fwhm, tablePreferences.fwhm.format);
        },
      },
      {
        showWhen: 'mu.show',
        index: 9,
        header: 'mu',
        accessorFn: (row) =>
          (row?.shape?.kind === 'pseudoVoigt' && row?.shape?.mu) || '',
        cell: ({ row }) => {
          const mu =
            row.original?.shape?.kind === 'pseudoVoigt' &&
            row.original?.shape?.mu;
          if (typeof mu !== 'number') {
            return '';
          }
          return formatNumber(mu, tablePreferences.mu.format);
        },
      },
      {
        showWhen: 'gamma.show',
        index: 9,
        header: 'gamma',
        accessorFn: (row) =>
          (row?.shape?.kind === 'generalizedLorentzian' && row?.shape?.gamma) ||
          '',
        cell: ({ row }) => {
          const gamma =
            row.original?.shape?.kind === 'generalizedLorentzian' &&
            row.original?.shape?.gamma;

          if (typeof gamma !== 'number') {
            return '';
          }

          return formatNumber(gamma, tablePreferences.gamma.format);
        },
      },
      {
        showWhen: 'showEditPeakShapeAction',
        ...createActionColumn<PeakRecord>({
          index: 20,
          id: 'edit-peak',
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
          id: 'delete-peak',
          icon: <FaRegTrashAlt />,
          onClick: deletePeakHandler,
        }),
      },
    ],
    [
      tablePreferences,
      saveDeltaPPMRefsHandler,
      deletePeakHandler,
      editPeakHandler,
    ],
  );

  const tableColumns = useMemo(() => {
    return getTableColumns(COLUMNS, (showWhen) =>
      dlv(tablePreferences, showWhen),
    );
  }, [COLUMNS, tablePreferences]);

  return { tableColumns, peak, setEditedPeak };
}

interface PeaksTableProps {
  tableColumns: Array<TanStackTableColumn<PeakRecord>>;
  data: PeakRecord[];
  info: Info1D;
}

function handleActiveRow(row: any) {
  return row.original.isConstantlyHighlighted;
}

function PeaksTable(props: PeaksTableProps) {
  const { tableColumns, data, info } = props;

  if (info?.isFid) {
    return <NoDataForFid />;
  }

  if (data.length === 0) {
    return <EmptyText text="No data" />;
  }

  return (
    <TanStackTable
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

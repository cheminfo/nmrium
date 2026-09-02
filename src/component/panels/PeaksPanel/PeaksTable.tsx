import type { Info1D, Peak1D } from '@zakodium/nmr-types';
import dlv from 'dlv';
import type { Dispatch, SetStateAction } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';

import { getPeakAbsoluteArea } from '../../../data/utilities/getPeakAbsoluteArea.ts';
import { useDispatch } from '../../context/DispatchContext.js';
import { EditableColumn } from '../../elements/EditableColumn.js';
import { EmptyText } from '../../elements/EmptyText.js';
import { TableHeaderLabel } from '../../elements/TableHeaderLabel.tsx';
import type {
  TanStackTableColumn,
  TanStackTableRow,
} from '../../elements/tanstack_table/index.ts';
import {
  TanStackTable,
  createActionColumn,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.ts';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { formatNumber } from '../../utility/formatNumber.js';
import { NoDataForFid } from '../extra/placeholder/NoDataForFid.js';

import type { PeakRecord } from './PeaksPanel.js';

function getFormattedNumber(
  value: unknown,
  format: Parameters<typeof formatNumber>[1],
) {
  return typeof value === 'number' ? formatNumber(value, format) : '';
}

interface UsePeaksTableColumnsReturn {
  tableColumns: Array<TanStackTableColumn<PeakRecord>>;
  peak: Peak1D | undefined;
  setEditedPeak: Dispatch<SetStateAction<Peak1D | undefined>>;
}

export function usePeaksTableColumns(
  activeTab: string,
): UsePeaksTableColumnsReturn {
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

  const saveRelativeAreaHandler = useCallback(
    (value: string | number, id: string) => {
      dispatch({
        type: 'CHANGE_PEAK_RELATIVE',
        payload: { value: Number(value), id },
      });
    },
    [dispatch],
  );

  const COLUMNS = useMemo(() => {
    const columnHelper = createTanStackColumnHelper<PeakRecord>();
    const columns = columnHelper.columns([]);
    // TODO: Use column visibility feature instead.
    if (dlv(tablePreferences, 'showSerialNumber')) {
      columns.push({
        id: 'rowNumber',
        header: '#',
        accessorFn: (_, index) => index + 1,
        meta: { style: { width: '1%', maxWidth: '40px', minWidth: '40px' } },
      });
    }
    if (dlv(tablePreferences, 'deltaPPM.show')) {
      columns.push({
        header: () => {
          return (
            <TableHeaderLabel
              text="δ (ppm)"
              shortText="δ"
              fontSize={12}
              fontWeight="bold"
            />
          );
        },
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
      });
    }
    if (dlv(tablePreferences, 'deltaHz.show')) {
      columns.push({
        header: 'δ (Hz)',
        accessorKey: 'xHz',
        cell: ({ row }) =>
          formatNumber(row.original.xHz, tablePreferences.deltaHz.format),
      });
    }
    if (dlv(tablePreferences, 'intensity.show')) {
      columns.push({
        header: 'Intensity',
        meta: { style: { maxWidth: '80px' } },
        accessorKey: 'y',
        cell: ({ row }) =>
          formatNumber(row.original.y, tablePreferences.intensity.format),
      });
    }
    if (dlv(tablePreferences, 'peakWidth.show')) {
      columns.push({
        header: 'Width (Hz)',
        accessorKey: 'width',
        cell: ({ row }) =>
          formatNumber(row.original.width, tablePreferences.peakWidth.format),
      });
    }
    if (dlv(tablePreferences, 'showKind')) {
      columns.push({
        header: 'Kind',
        accessorFn: (row) => row.shape?.kind || '',
      });
    }
    if (dlv(tablePreferences, 'fwhm.show')) {
      columns.push({
        header: 'fwhm',
        accessorFn: (row) => row?.shape?.fwhm ?? '',
        cell: ({ row }) =>
          getFormattedNumber(
            row.original?.shape?.fwhm,
            tablePreferences.fwhm.format,
          ),
      });
    }
    if (dlv(tablePreferences, 'mu.show')) {
      columns.push({
        header: 'mu',
        accessorFn: (row) =>
          row?.shape?.kind === 'pseudoVoigt' ? (row.shape.mu ?? '') : '',
        cell: ({ row }) => {
          const shape = row.original?.shape;
          const mu = shape?.kind === 'pseudoVoigt' ? shape.mu : undefined;
          return getFormattedNumber(mu, tablePreferences.mu.format);
        },
      });
    }
    if (dlv(tablePreferences, 'gamma.show')) {
      columns.push({
        header: 'gamma',
        accessorFn: (row) =>
          row?.shape?.kind === 'generalizedLorentzian'
            ? (row.shape.gamma ?? '')
            : '',
        cell: ({ row }) => {
          const shape = row.original?.shape;
          const gamma =
            shape?.kind === 'generalizedLorentzian' ? shape.gamma : undefined;
          return getFormattedNumber(gamma, tablePreferences.gamma.format);
        },
      });
    }
    if (dlv(tablePreferences, 'absoluteArea.show')) {
      columns.push({
        header: 'Absolute area',
        accessorFn: (row) => getPeakAbsoluteArea(row) ?? '',
        cell: ({ row }) =>
          getFormattedNumber(
            getPeakAbsoluteArea(row.original),
            tablePreferences.absoluteArea.format,
          ),
      });
    }
    if (dlv(tablePreferences, 'relativeArea.show')) {
      columns.push({
        header: () => {
          return (
            <TableHeaderLabel
              text="Relative area"
              shortText="Area"
              fontSize={12}
              fontWeight="bold"
            />
          );
        },
        accessorKey: 'relativeArea',
        cell: ({ row }) => {
          const value = formatNumber(
            row.original.relativeArea || 0,
            tablePreferences.relativeArea.format,
          );

          return (
            <EditableColumn
              value={value}
              onSave={(newValue) =>
                saveRelativeAreaHandler(newValue, row.original.id)
              }
              validate={(val) => val !== ''}
              type="number"
              style={{ padding: '0.1rem 0.4rem' }}
            />
          );
        },
      });
    }
    if (dlv(tablePreferences, 'showEditPeakShapeAction')) {
      columns.push(
        createActionColumn<PeakRecord>({
          id: 'edit-peak',
          icon: <FaEdit />,
          onClick: editPeakHandler,
          style: {
            borderRight: '0px',
          },
        }),
      );
    }
    if (dlv(tablePreferences, 'showDeleteAction')) {
      columns.push(
        createActionColumn<PeakRecord>({
          id: 'delete-peak',
          icon: <FaRegTrashAlt />,
          onClick: deletePeakHandler,
        }),
      );
    }
    return columns;
  }, [
    editPeakHandler,
    deletePeakHandler,
    tablePreferences,
    saveDeltaPPMRefsHandler,
    saveRelativeAreaHandler,
  ]);

  return { tableColumns: COLUMNS, peak, setEditedPeak };
}

interface PeaksTableProps {
  tableColumns: Array<TanStackTableColumn<PeakRecord>>;
  data: PeakRecord[];
  info: Info1D;
}

function handleActiveRow(row: TanStackTableRow<PeakRecord>) {
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

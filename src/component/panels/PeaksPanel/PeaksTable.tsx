import type { Info1D, Peak1D } from '@zakodium/nmr-types';
import dlv from 'dlv';
import { memo, useCallback, useMemo, useState } from 'react';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';
import type { CellProps, Row } from 'react-table';

import { getPeakAbsoluteArea } from '../../../data/utilities/getPeakAbsoluteArea.ts';
import { useDispatch } from '../../context/DispatchContext.js';
import { EditableColumn } from '../../elements/EditableColumn.js';
import { EmptyText } from '../../elements/EmptyText.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import type { ControlCustomColumn } from '../../elements/ReactTable/utility/addCustomColumn.js';
import addCustomColumn, {
  createActionColumn,
} from '../../elements/ReactTable/utility/addCustomColumn.js';
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

export function usePeaksTableColumns(activeTab: string) {
  const dispatch = useDispatch();
  const { tablePreferences } = usePanelPreferences('peaks', activeTab);
  const [peak, setEditedPeak] = useState<Peak1D | undefined>();

  const deletePeakHandler = useCallback(
    (row: Row<PeakRecord>) => {
      const params = row.original;
      dispatch({
        type: 'DELETE_PEAK',
        payload: { id: params.id },
      });
    },
    [dispatch],
  );

  const editPeakHandler = useCallback((row: Row<PeakRecord>) => {
    setEditedPeak(row.original);
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

  const COLUMNS = useMemo<Array<ControlCustomColumn<PeakRecord>>>(
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
        Cell: ({ row }: CellProps<PeakRecord>) => (
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
        Header: 'δ (Hz)',
        accessor: 'xHz',
        Cell: ({ row }: CellProps<PeakRecord>) =>
          formatNumber(row.original.xHz, tablePreferences.deltaHz.format),
      },
      {
        showWhen: 'intensity.show',
        index: 5,
        Header: 'Intensity',
        style: { maxWidth: '80px' },
        accessor: 'y',
        Cell: ({ row }: CellProps<PeakRecord>) =>
          formatNumber(row.original.y, tablePreferences.intensity.format),
      },
      {
        showWhen: 'peakWidth.show',
        index: 6,
        Header: 'Width (Hz)',
        accessor: 'width',
        Cell: ({ row }: CellProps<PeakRecord>) =>
          formatNumber(row.original.width, tablePreferences.peakWidth.format),
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
        accessor: (row) => row?.shape?.fwhm ?? '',
        Cell: ({ row }: CellProps<PeakRecord>) =>
          getFormattedNumber(
            row.original?.shape?.fwhm,
            tablePreferences.fwhm.format,
          ),
      },
      {
        showWhen: 'mu.show',
        index: 9,
        Header: 'mu',
        accessor: (row) =>
          row?.shape?.kind === 'pseudoVoigt' ? (row.shape.mu ?? '') : '',
        Cell: ({ row }: CellProps<PeakRecord>) => {
          const shape = row.original?.shape;
          const mu = shape?.kind === 'pseudoVoigt' ? shape.mu : undefined;
          return getFormattedNumber(mu, tablePreferences.mu.format);
        },
      },
      {
        showWhen: 'gamma.show',
        index: 10,
        Header: 'gamma',
        accessor: (row) =>
          row?.shape?.kind === 'generalizedLorentzian'
            ? (row.shape.gamma ?? '')
            : '',
        Cell: ({ row }: CellProps<PeakRecord>) => {
          const shape = row.original?.shape;
          const gamma =
            shape?.kind === 'generalizedLorentzian' ? shape.gamma : undefined;
          return getFormattedNumber(gamma, tablePreferences.gamma.format);
        },
      },
      {
        showWhen: 'absoluteArea.show',
        index: 11,
        Header: 'Absolute area',
        accessor: (row) => getPeakAbsoluteArea(row) ?? '',
        Cell: ({ row }: CellProps<PeakRecord>) =>
          getFormattedNumber(
            getPeakAbsoluteArea(row.original),
            tablePreferences.absoluteArea.format,
          ),
      },
      {
        showWhen: 'relativeArea.show',
        index: 12,
        Header: 'Relative area',
        Cell: ({ row }: CellProps<PeakRecord>) => {
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
      editPeakHandler,
      deletePeakHandler,
      tablePreferences,
      saveDeltaPPMRefsHandler,
      saveRelativeAreaHandler,
    ],
  );

  const tableColumns = useMemo(() => {
    const columns: Array<ControlCustomColumn<PeakRecord>> = [];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (dlv(tablePreferences, showWhen)) {
        addCustomColumn(columns, colParams);
      }
    }

    columns.sort((object1, object2) => object1.index - object2.index);
    return columns;
  }, [COLUMNS, tablePreferences]);

  return { tableColumns, peak, setEditedPeak };
}

interface PeaksTableProps {
  tableColumns: Array<ControlCustomColumn<PeakRecord>>;
  data: PeakRecord[];
  info: Info1D;
}

function handleActiveRow(row: Row<PeakRecord>) {
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

import { Classes } from '@blueprintjs/core';
import type { WorkspacePanelPreferences } from '@zakodium/nmrium-core';
import dlv from 'dlv';
import type { DatabaseNMREntry } from 'nmr-processing';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { FaDownload, FaInfoCircle, FaMinus, FaPlus } from 'react-icons/fa';
import { IdcodeSvgRenderer, SmilesSvgRenderer } from 'react-ocl';
import { Button } from 'react-science/ui';

import type { PrepareDataResult } from '../../../data/data1d/database.js';
import { ColumnWrapper } from '../../elements/ColumnWrapper.js';
import type { ContextMenuItem } from '../../elements/ContextMenuBluePrint.tsx';
import {
  TanStackTable,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.ts';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { formatNumber } from '../../utility/formatNumber.js';

import { DatabaseInfo } from './DatabaseInfo.js';

const contextMenu: ContextMenuItem[] = [
  {
    text: 'Add all spectra',
    icon: <FaPlus />,
    data: { id: 'addAllSpectra' },
    disabled: (data) => !data.jcampFullURL,
  },
];

interface ToggleEvent {
  onAdd: (row: any, isFullJcamp: boolean) => void;
  onRemove: (row: any) => void;
}
interface DatabaseTableProps extends ToggleEvent {
  data: any;
  onSave: (row: any) => void;
  totalCount: number;
}

const overFlowStyle: CSSProperties = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

const columnHelper = createTanStackColumnHelper<PrepareDataResult>();

function databaseTableColumns(
  databasePreferences: WorkspacePanelPreferences['database'],
) {
  const columns = columnHelper.columns([]);
  // TODO: Use column visibility feature instead.
  if (dlv(databasePreferences, 'showNames')) {
    columns.push({
      header: 'names',
      accessorFn: (row) => (row.names ? row.names.join(',') : ''),
      spanRows: true,
      meta: {
        style: {
          width: '100px',
          minWidth: '100px',
          maxWidth: '100px',
          ...overFlowStyle,
        },
      },
    });
  }
  if (dlv(databasePreferences, 'range.show')) {
    columns.push({
      header: 'From - To',
      accessorFn: (row) => {
        const rangeFormat = databasePreferences.range.format;
        return row?.from && row?.to
          ? `${formatNumber(row.from, rangeFormat)} - ${formatNumber(
              row.to,
              rangeFormat,
            )}`
          : '';
      },
      spanRows: true,
    });
  }
  if (dlv(databasePreferences, 'delta.show')) {
    columns.push({
      header: 'δ (ppm)',
      accessorKey: 'delta',
      cell: ({ row }) =>
        row.original.delta
          ? formatNumber(row.original.delta, databasePreferences.delta.format)
          : '',
    });
  }
  if (dlv(databasePreferences, 'showAssignment')) {
    columns.push({
      header: 'Assignment',
      accessorKey: 'assignment',
    });
  }
  if (dlv(databasePreferences, 'showMultiplicity')) {
    columns.push({
      header: 'Multi.',
      accessorKey: 'multiplicity',
    });
  }
  if (dlv(databasePreferences, 'coupling.show')) {
    columns.push({
      header: 'J (Hz)',
      accessorFn: (row) => {
        if (!row?.coupling) {
          return '';
        } else {
          return row.coupling
            .split(',')
            .map((value) =>
              formatNumber(value, databasePreferences.coupling.format),
            )
            .join(',');
        }
      },
      meta: {
        style: {
          width: '60px',
          minWidth: '60px',
          ...overFlowStyle,
        },
      },
    });
  }
  if (dlv(databasePreferences, 'showSolvent')) {
    columns.push({
      header: 'Solvent',
      accessorKey: 'solvent',
      meta: {
        style: {
          width: '80px',
          minWidth: '80px',
          ...overFlowStyle,
        },
      },
    });
  }
  if (dlv(databasePreferences, 'showSmiles')) {
    columns.push({
      header: 'structure',
      accessorKey: 'index',
      spanRows: true,
      meta: { style: { height: 0 } },
      cell({ row }) {
        const { idCode, coordinates } = row.original?.ocl || {};
        const smiles = row.original?.smiles;
        const { minWidth = 0, minHeight = 0 } =
          databasePreferences?.structureSize || {};
        return (
          <ResponsiveChart minWidth={minWidth} minHeight={minHeight}>
            {({ width, height }) => {
              if (idCode && coordinates) {
                return (
                  <IdcodeSvgRenderer
                    height={height}
                    width={width}
                    idcode={idCode}
                    coordinates={coordinates}
                    noAtomCustomLabels
                  />
                );
              } else if (smiles) {
                return (
                  <SmilesSvgRenderer
                    height={height}
                    width={width}
                    smiles={smiles}
                    noAtomCustomLabels
                  />
                );
              } else {
                return null;
              }
            }}
          </ResponsiveChart>
        );
      },
    });
  }
  return columns;
}

function DatabaseTable(props: DatabaseTableProps) {
  const { data, onAdd, onRemove, onSave, totalCount } = props;
  const databasePreferences = usePanelPreferences('database');

  const beforeColumns = useMemo(() => {
    return columnHelper.columns([
      {
        id: 'meta',
        header: '',
        accessorKey: 'index',
        spanRows: true,
        meta: {
          style: {
            width: '1%',
            maxWidth: '25px',
            minWidth: '25px',
            padding: 0,
          },
        },
        cell: ({ row }) => {
          return (
            <Button
              style={{ padding: 0 }}
              minimal
              small
              icon={<FaInfoCircle />}
              tooltipProps={{
                content: (
                  <DatabaseInfo data={row.original as DatabaseNMREntry} />
                ),
              }}
            />
          );
        },
      },
    ]);
  }, []);
  const afterColumns = useMemo(() => {
    return columnHelper.columns([
      {
        id: 'add-button',
        header: '',
        spanRows: true,
        meta: {
          style: {
            width: '1%',
            maxWidth: '60px',
            minWidth: '60px',
            padding: 0,
          },
        },
        accessorKey: 'index',
        cell: ({ row }) => {
          // TODO: Fix types or remove code. Also in getHighlightExtra
          // @ts-expect-error jcampURL is not defined in PrepareDataResult.
          const { jcampURL } = row.original;
          return (
            <ColumnWrapper
              style={{ display: 'flex', justifyContent: 'space-evenly' }}
            >
              <ToggleBtn
                onAdd={onAdd}
                onRemove={onRemove}
                data={row.original}
              />

              {databasePreferences?.allowSaveAsNMRium && (
                <Button
                  size="small"
                  variant="outlined"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => onSave(row.original)}
                  disabled={!jcampURL}
                >
                  <FaDownload className={Classes.ICON} />
                </Button>
              )}
            </ColumnWrapper>
          );
        },
      },
    ]);
  }, [databasePreferences?.allowSaveAsNMRium, onAdd, onRemove, onSave]);
  const tableColumns = useMemo(() => {
    return [
      ...beforeColumns,
      ...databaseTableColumns(databasePreferences),
      ...afterColumns,
    ];
  }, [databasePreferences, beforeColumns, afterColumns]);

  const selectContextMenuHandler = useCallback(
    (option: any, data: any) => {
      const { id } = option;

      if (id !== 'addAllSpectra') {
        return;
      }

      onAdd(data, true);
    },
    [onAdd],
  );

  return (
    <TanStackTable
      data={data}
      contextMenu={contextMenu}
      onContextMenuSelect={selectContextMenuHandler}
      columns={tableColumns}
      highlightedSource="DATABASE"
      getHighlightExtra={(row) => ({
        // @ts-expect-error jcampURL is not defined in PrepareDataResult.
        jcampURL: row.jcampURL,
        // @ts-expect-error baseURL is not defined in PrepareDataResult.
        baseURL: row.baseURL,
        // @ts-expect-error ranges is not defined in PrepareDataResult.
        ranges: row.ranges,
      })}
      groupKey="index"
      approxItemHeight={23}
      enableVirtualScroll
      totalCount={totalCount}
      enableCellSpanning
      disableDefaultRowStyle
    />
  );
}

interface ToggleBtnProps extends ToggleEvent {
  data: PrepareDataResult;
}

function ToggleBtn(props: ToggleBtnProps) {
  const { onAdd, onRemove, data } = props;
  const spectra = useSpectraByActiveNucleus();
  const isAdded = spectra.some((spectrum) => spectrum.id === data.spectrumID);

  return (
    <Button
      size="small"
      intent={isAdded ? 'danger' : 'success'}
      variant="outlined"
      tooltipProps={{ content: '', disabled: true }}
      onClick={() => {
        if (isAdded) {
          onRemove(data);
        } else {
          onAdd(data, false);
        }
      }}
    >
      {isAdded ? (
        <FaMinus className={Classes.ICON} />
      ) : (
        <FaPlus className={Classes.ICON} />
      )}
    </Button>
  );
}

export default memo(DatabaseTable);

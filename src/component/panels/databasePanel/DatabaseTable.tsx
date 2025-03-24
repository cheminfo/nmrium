import { Classes } from '@blueprintjs/core';
import dlv from 'dlv';
import type { CSSProperties } from 'react';
import { memo, useMemo } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { FaDownload, FaMinus, FaPlus } from 'react-icons/fa';
import { IdcodeSvgRenderer, SmilesSvgRenderer } from 'react-ocl/full';
import { Button } from 'react-science/ui';

import type { PrepareDataResult } from '../../../data/data1d/database.js';
import { ColumnWrapper } from '../../elements/ColumnWrapper.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import type { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn.js';
import addCustomColumn from '../../elements/ReactTable/utility/addCustomColumn.js';
import { HighlightEventSource } from '../../highlight/index.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { formatNumber } from '../../utility/formatNumber.js';

interface ToggleEvent {
  onAdd: (row: any) => void;
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

const databaseTableColumns = (
  databasePreferences,
): Array<CustomColumn<PrepareDataResult> & { showWhen: string }> => [
  {
    showWhen: 'showNames',
    index: 1,
    Header: 'names',
    accessor: (row) => (row.names ? row.names.join(',') : ''),
    enableRowSpan: true,
    style: {
      width: '100px',
      minWidth: '100px',
      maxWidth: '100px',
      ...overFlowStyle,
    },
  },
  {
    showWhen: 'range.show',
    index: 2,
    Header: 'From - To',
    accessor: (row) => {
      const rangeFormat = databasePreferences.range.format;
      return row?.from && row?.to
        ? `${formatNumber(row.from, rangeFormat)} - ${formatNumber(
            row.to,
            rangeFormat,
          )}`
        : '';
    },
    enableRowSpan: true,
  },
  {
    showWhen: 'delta.show',
    index: 3,
    Header: 'δ (ppm)',
    accessor: 'delta',
    Cell: ({ row }) =>
      row.original.delta
        ? formatNumber(row.original.delta, databasePreferences.delta.format)
        : '',
  },

  {
    showWhen: 'showAssignment',
    index: 4,
    Header: 'Assignment',
    accessor: 'assignment',
  },
  {
    showWhen: 'showMultiplicity',
    index: 5,
    Header: 'Multi.',
    accessor: 'multiplicity',
  },

  {
    showWhen: 'coupling.show',
    index: 6,
    Header: 'J (Hz)',
    accessor: (row) => {
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
    style: {
      width: '60px',
      minWidth: '60px',
      ...overFlowStyle,
    },
  },
  {
    showWhen: 'showSolvent',
    index: 7,
    Header: 'Solvent',
    accessor: 'solvent',
    style: {
      width: '80px',
      minWidth: '80px',
      ...overFlowStyle,
    },
  },
  {
    showWhen: 'showSmiles',
    index: 8,
    Header: 'structure',
    accessor: 'index',
    style: { height: 0 },
    enableRowSpan: true,
    Cell({ row }) {
      const { idCode, coordinates } = row.original?.ocl || {};
      const smiles = row.original?.smiles;
      return (
        <ResponsiveChart minWidth={50} minHeight={23}>
          {({ width, height }) => {
            if (idCode && coordinates) {
              return (
                <IdcodeSvgRenderer
                  height={height}
                  width={width}
                  idcode={idCode}
                  coordinates={coordinates}
                />
              );
            } else if (smiles) {
              return (
                <SmilesSvgRenderer
                  height={height}
                  width={width}
                  smiles={smiles}
                />
              );
            } else {
              return null;
            }
          }}
        </ResponsiveChart>
      );
    },
  },
];

function DatabaseTable({
  data,
  onAdd,
  onRemove,
  onSave,
  totalCount,
}: DatabaseTableProps) {
  const databasePreferences = usePanelPreferences('database');

  const initialColumns = useMemo(
    () => [
      {
        index: 10,
        id: 'add-button',
        Header: '',
        style: {
          width: '1%',
          maxWidth: '60px',
          minWidth: '60px',
          padding: 0,
        },
        accessor: 'index',
        enableRowSpan: true,
        Cell: ({ row }) => {
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
    ],
    [databasePreferences?.allowSaveAsNMRium, onAdd, onRemove, onSave],
  );

  const tableColumns = useMemo(() => {
    const columns = [...initialColumns];
    for (const col of databaseTableColumns(databasePreferences)) {
      const { showWhen, ...colParams } = col;
      if (dlv(databasePreferences, showWhen, false)) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [databasePreferences, initialColumns]);
  return (
    <ReactTable
      data={data}
      columns={tableColumns}
      highlightedSource={HighlightEventSource.DATABASE}
      groupKey="index"
      approxItemHeight={23}
      enableVirtualScroll
      totalCount={totalCount}
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
          onAdd(data);
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

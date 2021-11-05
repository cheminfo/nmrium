/** @jsxImportSource @emotion/react */
import { useMemo, memo, CSSProperties } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SmilesSvgRenderer } from 'react-ocl';

import { usePreferences } from '../../context/PreferencesContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import addCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/addCustomColumn';
import { HighlightedSource } from '../../highlight';
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';
import { databaseDefaultValues } from '../extra/preferences/defaultValues';

interface DatabaseTableProps {
  data: any;
  onAdd: (row: any) => void;
}

const overFlowStyle: CSSProperties = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

const COLUMNS: (CustomColumn & { showWhen: string })[] = [
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
    showWhen: 'showRange',
    index: 2,
    Header: 'From - To',
    accessor: (row) => `${row.from.toFixed(2)} - ${row.to.toFixed(2)}`,
    enableRowSpan: true,
  },
  {
    showWhen: 'showDelta',
    index: 3,
    Header: 'δ (ppm)',
    accessor: 'delta',
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
    showWhen: 'showCoupling',
    index: 6,
    Header: 'J (Hz)',
    accessor: 'coupling',
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
    Header: 'Smiles',
    accessor: 'index',
    enableRowSpan: true,
    Cell: ({ row }) => (
      <div
        className="smiles-container"
        style={{ width: '100px', display: 'block', overflow: 'hidden' }}
      >
        {row?.original.smiles && (
          <SmilesSvgRenderer
            height={60}
            width={60}
            smiles={row.original.smiles}
          />
        )}
      </div>
    ),
  },
];

function DatabaseTable({ data, onAdd }: DatabaseTableProps) {
  const preferences = usePreferences();

  const initialColumns = useMemo(
    () => [
      {
        index: 10,
        Header: '',
        width: '1%',
        maxWidth: '24px',
        minWidth: '24px',
        id: 'add-button',
        accessor: 'index',
        enableRowSpan: true,
        Cell: ({ row }) => (
          <button
            type="button"
            className="add-button"
            onClick={() => onAdd(row)}
          >
            <FaPlus />
          </button>
        ),
      },
    ],
    [onAdd],
  );

  const tableColumns = useMemo(() => {
    const databasePreferences = getValue(
      preferences,
      'formatting.panels.database',
      databaseDefaultValues,
    );

    let columns = [...initialColumns];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (databasePreferences[showWhen]) {
        addCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [initialColumns, preferences]);

  return data && data.length > 0 ? (
    <ReactTable
      data={data}
      columns={tableColumns}
      highlightedSource={HighlightedSource.DATABASE}
      groupKey="index"
      approxItemHeight={30}
      enableVirtualScroll
    />
  ) : (
    <NoTableData />
  );
}

export default memo(DatabaseTable);

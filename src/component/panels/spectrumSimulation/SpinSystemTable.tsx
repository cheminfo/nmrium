import { useMemo } from 'react';

import Input from '../../elements/Input';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import addCustomColumn from '../../elements/ReactTable/utility/addCustomColumn';

interface SpinSystemTableProps {
  spinSystem: string;
}

export function SpinSystemTable(props: SpinSystemTableProps) {
  let { spinSystem } = props;

  const tableColumns = useMemo(() => {
    let columns: Column<(number | null)[]>[] = [
      {
        id: 'rowLabel',
        Header: '',
        accessor: (_, index) => spinSystem.at(index),
      },
      {
        Header: 'Delta',
        Cell: ({ row }) => <Input value={row.original[0] || 0} />,
      },
    ];
    let i = 0;

    for (const label of spinSystem.slice(0, -1)) {
      const columnIndex = i + 1;
      addCustomColumn(columns, {
        id: label,
        index: i,
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        Cell: function cellRender({ row }) {
          const val = row.original?.[columnIndex] ?? null;
          if (val !== null) {
            return <Input value={row.original[i + 1]} />;
          }
          return <div />;
        },
        Header: () => (
          <span>
            J<sub>{label}-</sub>(Hz)
          </span>
        ),
      });
      i++;
    }
    return columns;
  }, [spinSystem]);

  const tableData = useMemo(() => {
    const rows: (number | null)[][] = [];
    const spinLength = spinSystem.length;

    for (let i = 1; i <= spinLength; i++) {
      const columns: (number | null)[] = [];
      for (let j = 0; j < spinLength; j++) {
        if (j < i && i !== 1) {
          columns.push(0);
        } else {
          columns.push(null);
        }
      }

      columns[0] = i;
      rows.push(columns);
    }
    return rows;
  }, [spinSystem]);

  if (!spinSystem) {
    return null;
  }

  return <ReactTable columns={tableColumns} data={tableData} />;
}

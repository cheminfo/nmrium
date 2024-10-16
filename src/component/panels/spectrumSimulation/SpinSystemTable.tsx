import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import addCustomColumn from '../../elements/ReactTable/utility/addCustomColumn.js';

const cellStyle: CSSProperties = {
  padding: '1px',
  border: 'none',
  borderWidth: 0,
};

interface SpinSystemTableProps {
  spinSystem: string;
}

export function SpinSystemTable(props: SpinSystemTableProps) {
  const { spinSystem } = props;
  const { control } = useFormContext();
  const data = useWatch({ name: 'data' });

  const tableColumns = useMemo(() => {
    const columns: Array<Column<Array<number | null>>> = [
      {
        id: 'rowLabel',
        Header: '',
        accessor: (_, index) => spinSystem.at(index),
      },
      {
        Header: 'Delta',
        style: cellStyle,
        Cell: ({ row }) => (
          <NumberInput2Controller
            control={control}
            name={`data.${row.index}.0`}
            fill
            controllerProps={{ rules: { required: true } }}
          />
        ),
      },
    ];
    let i = 0;

    for (const label of spinSystem.slice(0, -1)) {
      const columnIndex = i + 1;
      addCustomColumn(columns, {
        id: label,
        index: i,
        style: cellStyle,
        Cell: function cellRender({ row }) {
          const val = row.original?.[columnIndex] ?? null;
          if (val !== null) {
            return (
              <NumberInput2Controller
                control={control}
                name={`data.${row.index}.${columnIndex}`}
                fill
                controllerProps={{ rules: { required: true } }}
              />
            );
          }
          return <div />;
        },
        Header: () => (
          <span>
            J<sub>{label}-X</sub>(Hz)
          </span>
        ),
      });
      i++;
    }
    return columns;
  }, [control, spinSystem]);

  if (!spinSystem) {
    return null;
  }

  return <ReactTable columns={tableColumns} data={data} />;
}

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import TanStackTable from '../../elements/TanStackTable/TanStackTable.js';
import type { CustomColumn } from '../../elements/TanStackTable/utility/addCustomColumn.js';
import addCustomColumn from '../../elements/TanStackTable/utility/addCustomColumn.js';

const cellStyle: CSSProperties = {
  padding: '1px',
  border: 'none',
  borderWidth: 0,
};

interface SpinSystemTableProps {
  spinSystem: string;
}

type SpinSystemElement = Array<number | null>;

export function SpinSystemTable(props: SpinSystemTableProps) {
  const { spinSystem } = props;
  const { control } = useFormContext();
  const data = useWatch({ name: 'data' });

  const tableColumns = useMemo(() => {
    const columns: Array<CustomColumn<SpinSystemElement>> = [
      {
        index: 0,
        id: 'rowLabel',
        header: '',
        accessorFn: (_, index) => spinSystem.at(index),
      },
      {
        index: 1,
        header: 'Delta',
        meta: { style: cellStyle },
        cell: ({ row }) => (
          <NumberInput2Controller
            control={control}
            name={`data.${row.index}.0`}
            fill
            debounceTime={500}
          />
        ),
      },
    ];
    let i = 0;

    for (const label of spinSystem.slice(0, -1)) {
      const columnIndex = i + 1;
      addCustomColumn(columns, {
        id: label,
        index: i + 2,
        meta: { style: cellStyle },
        cell: function cellRender({ row }) {
          const val = row.original?.[columnIndex] ?? null;
          if (val !== null) {
            return (
              <NumberInput2Controller
                control={control}
                name={`data.${row.index}.${columnIndex}`}
                fill
                debounceTime={500}
              />
            );
          }
          return <div />;
        },
        header: () => (
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

  return <TanStackTable columns={tableColumns} data={data} />;
}

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import {
  TanStackTable,
  createTanStackColumnHelper,
} from '../../elements/tanstack_table/index.ts';

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
    const columnHelper = createTanStackColumnHelper<SpinSystemElement>();
    const columns = columnHelper.columns([
      {
        id: 'rowLabel',
        header: '',
        accessorFn: (_, index) => spinSystem.at(index),
      },
      {
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
    ]);

    let i = 0;
    for (const label of spinSystem.slice(0, -1)) {
      const columnIndex = i + 1;
      columns.push({
        id: label,
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

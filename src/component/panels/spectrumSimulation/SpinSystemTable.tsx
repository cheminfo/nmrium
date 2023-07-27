import { useFormikContext } from 'formik';
import { CSSProperties, useMemo } from 'react';

import { InputStyle } from '../../elements/Input';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import addCustomColumn from '../../elements/ReactTable/utility/addCustomColumn';
import FormikInput from '../../elements/formik/FormikInput';

const cellStyle: CSSProperties = {
  padding: '1px',
  border: 'none',
  borderWidth: 0,
};

const inputStyle: InputStyle = {
  input: {
    padding: '5px',
  },
  inputWrapper: {
    borderRadius: 0,
  },
};

interface SpinSystemTableProps {
  spinSystem: string;
}

export function SpinSystemTable(props: SpinSystemTableProps) {
  const { spinSystem } = props;
  const {
    values: { data },
  } = useFormikContext<any>();

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
          <FormikInput
            name={`data.${row.index}.0`}
            style={inputStyle}
            value={row.original[0] || 0}
            type="number"
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
              <FormikInput
                name={`data.${row.index}.${columnIndex}`}
                style={inputStyle}
                type="number"
              />
            );
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

  if (!spinSystem) {
    return null;
  }

  return <ReactTable columns={tableColumns} data={data} />;
}

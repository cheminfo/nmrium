import { useFormikContext } from 'formik';
import { LegendField, PredefinedLegendField } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import { useChartData } from '../../../context/ChartContext';
import Button from '../../../elements/Button';
import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../elements/formik/FormikInput';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../../utility/getSpectraObjectPaths';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
    border: 'none',
    padding: 0,
    height: '100%',
    textAlign: 'left',
    borderRadius: 0,
  },
  column: {
    padding: '5px',
  },
};

function LegendsPreferences() {
  const { values, setFieldValue } = useFormikContext();
  const { data } = useChartData();
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );

  const fields = (values as any)?.legendsFields;

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: any[] = [];
      const emptyField = {
        jpath: null,
        visible: true,
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      void setFieldValue('legendsFields', columns);
    },
    [setFieldValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue('legendsFields', _fields);
    },
    [setFieldValue],
  );

  const COLUMNS: Array<Column<LegendField>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        Cell: ({ row }) => {
          const predefinedColumn = row.original as PredefinedLegendField;
          if (predefinedColumn?.name) {
            return <p>{predefinedColumn.label}</p>;
          }

          return (
            <FormikInput
              name={`legendsFields.${row.index}.jpath`}
              style={{ input: styles.input }}
              mapOnChangeValue={(key) => paths?.[key] || null}
              mapValue={(paths) => convertPathArrayToString(paths)}
              datalist={datalist}
            />
          );
        },
      },
      {
        Header: 'Visible',
        style: { width: '30px', ...styles.column },
        Cell: ({ row }) => (
          <CheckBoxCell
            name={`legendsFields.${row.index}.visible`}
            defaultValue
          />
        ),
      },
      {
        Header: '',
        style: { width: '30px', ...styles.column },
        id: 'add-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex' }}>
              <Button.Done
                fill="outline"
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus />
              </Button.Done>
              {!record?.name && (
                <Button.Danger
                  fill="outline"
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaTimes />
                </Button.Danger>
              )}
            </div>
          );
        },
      },
    ],
    [addHandler, datalist, deleteHandler, paths],
  );

  return (
    <ReactTable
      data={fields}
      columns={COLUMNS}
      style={{ table: { height: '100%' } }}
    />
  );
}

export default LegendsPreferences;

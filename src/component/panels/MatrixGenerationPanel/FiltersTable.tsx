/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../elements/Button';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import Select from '../../elements/Select';

import { DEFAULT_MATRIX_FILTERS } from './MatrixGenerationPanel';

export function FiltersTable() {
  const { values, setFieldValue } = useFormikContext<any>();

  if (!values?.filters && Array.isArray(values.filters)) {
    return null;
  }

  function handelSelectFilter(value, index) {
    const filters = values.filters.slice(0);
    filters.splice(index, 1, value);
    setFieldValue('filters', filters);
  }

  function handleAdd(index) {
    if (values.filters) {
      setFieldValue('filters', [
        ...values.filters.slice(0, index),
        DEFAULT_MATRIX_FILTERS[0],
        ...values.filters.slice(index),
      ]);
    }
  }
  function handleDelete(index) {
    setFieldValue(
      'filters',
      values.filters.filter((_, i) => i !== index),
    );
  }

  const filtersColumns: Column<any>[] = [
    {
      Header: '#',
      style: { width: '50px' },
      accessor: (_, index) => index + 1,
    },
    {
      Header: 'Filter name',
      Cell: ({ row }) => (
        <Select
          value={row.original.name}
          items={DEFAULT_MATRIX_FILTERS as any}
          onChange={(value) => handelSelectFilter(value, row.index)}
          itemValueField="name"
          itemTextField="name"
          style={{ width: '100%' }}
          returnValue={false}
        />
      ),
    },

    {
      Header: '',
      style: { width: '70px' },
      id: 'actions',
      Cell: ({ row }) => {
        return (
          <div style={{ display: 'flex' }}>
            <Button.Danger
              fill="outline"
              onClick={() => handleDelete(row.index)}
            >
              <FaTimes />
            </Button.Danger>

            <Button.Done
              fill="outline"
              onClick={() => handleAdd(row.index + 1)}
            >
              <FaPlus />
            </Button.Done>
          </div>
        );
      },
    },
  ];

  return (
    <ReactTable
      columns={filtersColumns}
      data={values.filters}
      emptyDataRowText="No Filters"
    />
  );
}

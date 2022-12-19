/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { FaTimes } from 'react-icons/fa';

import Button from '../../elements/Button';
import { InputStyle } from '../../elements/Input';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import FormikInput from '../../elements/formik/FormikInput';

const inputStyle: InputStyle = {
  input: {
    width: '100%',
    fontSize: '1.1em',
    textAlign: 'left',
    // padding: '0.1em 0.1em',
  },
};

export function ExclusionsZonesTable() {
  const { values, setFieldValue } = useFormikContext<any>();

  if (!values?.exclusionsZones && Array.isArray(values.exclusionsZones)) {
    return null;
  }

  function handleDelete(index) {
    setFieldValue(
      'exclusionsZones',
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
      Header: 'from',
      Cell: ({ row }) => (
        <FormikInput
          name={`exclusionsZones.${row.index}.from`}
          type="number"
          style={inputStyle}
        />
      ),
    },
    {
      Header: 'To',
      Cell: ({ row }) => (
        <FormikInput
          name={`exclusionsZones.${row.index}.to`}
          type="number"
          style={inputStyle}
        />
      ),
    },

    {
      Header: '',
      style: { width: '70px' },
      id: 'actions',
      Cell: ({ row }) => {
        return (
          <Button.Danger fill="outline" onClick={() => handleDelete(row.index)}>
            <FaTimes />
          </Button.Danger>
        );
      },
    },
  ];

  return (
    <ReactTable
      columns={filtersColumns}
      data={values.exclusionsZones}
      emptyDataRowText="No Zones"
    />
  );
}

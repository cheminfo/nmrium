import { useFormikContext } from 'formik';
import { NucleiPreferences } from 'nmr-load-save';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../../elements/Button';
import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../elements/formik/FormikInput';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
  },
  column: {
    padding: '2px',
  },
};

function NucleiTabContent() {
  const { values, setFieldValue } = useFormikContext();

  const fields = (values as any)?.nuclei || [];

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: NucleiPreferences[] = [];
      const emptyField: NucleiPreferences = {
        nucleus: '',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      void setFieldValue('nuclei', columns);
    },
    [setFieldValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue('nuclei', _fields);
    },
    [setFieldValue],
  );

  const COLUMNS: Array<Column<any>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Nucleus',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.nucleus`}
              style={{ input: styles.input }}
            />
          );
        },
      },
      {
        Header: 'δ (ppm)',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.ppmFormat`}
              style={{ input: styles.input }}
            />
          );
        },
      },
      {
        Header: 'Coupling (Hz)',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.hzFormat`}
              style={{ input: styles.input }}
            />
          );
        },
      },
      {
        Header: 'Axis from',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.axisFrom`}
              style={{ input: styles.input }}
              type="number"
            />
          );
        },
      },
      {
        Header: 'Axis to',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.axisTo`}
              style={{ input: styles.input }}
              type="number"
            />
          );
        },
      },

      {
        Header: '',
        style: { width: '70px', ...styles.column },
        id: 'add-button',
        Cell: ({ data, row }) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button.Done
                fill="outline"
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus />
              </Button.Done>
              <Button.Danger
                fill="outline"
                onClick={() => deleteHandler(data, row.index)}
              >
                <FaTimes />
              </Button.Danger>
            </div>
          );
        },
      },
    ],
    [addHandler, deleteHandler],
  );

  return (
    <div>
      <GroupPane
        text="Number formatting for crosshair and info line and axis domain"
        renderHeader={(text) => {
          return (
            <FieldsBlockHeader
              text={text}
              onAdd={() => addHandler(fields, 0)}
            />
          );
        }}
      >
        <ReactTable
          style={{
            'table, table td, table th': { border: 'none' },
            'table thead': { borderBottom: '1px solid #f9f9f9' },
          }}
          data={fields}
          columns={COLUMNS}
          emptyDataRowText="No Nucleus"
        />
      </GroupPane>
    </div>
  );
}

function FieldsBlockHeader({ onAdd, text }) {
  return (
    <div className="section-header" style={{ display: 'flex' }}>
      <p style={{ flex: 1 }}>{text}</p>

      <Button.Done fill="outline" size="xSmall" onClick={onAdd}>
        Add nuclei preferences
      </Button.Done>
    </div>
  );
}

export default NucleiTabContent;

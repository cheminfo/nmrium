import { useFormikContext } from 'formik';
import { NucleiPreferences } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { GroupPane } from '../../../elements/GroupPane';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { tableInputStyle } from '../../../elements/ReactTable/Style';
import FormikInput from '../../../elements/formik/FormikInput';

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
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Nucleus',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.nucleus`}
              style={tableInputStyle}
            />
          );
        },
      },
      {
        Header: 'δ (ppm)',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.ppmFormat`}
              style={tableInputStyle}
            />
          );
        },
      },
      {
        Header: 'Coupling (Hz)',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.hzFormat`}
              style={tableInputStyle}
            />
          );
        },
      },
      {
        Header: 'Axis from',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.axisFrom`}
              style={tableInputStyle}
              type="number"
            />
          );
        },
      },
      {
        Header: 'Axis to',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${row.index}.axisTo`}
              style={tableInputStyle}
              type="number"
            />
          );
        },
      },

      {
        Header: '',
        style: { width: '70px' },
        id: 'add-button',
        Cell: ({ data, row }) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                small
                outlined
                intent="success"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus />
              </Button>
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => deleteHandler(data, row.index)}
              >
                <FaRegTrashAlt />
              </Button>
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
            'thead tr th': { zIndex: 1 },
            td: { padding: 0 },
          }}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
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

      <Button
        small
        outlined
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add nuclei preferences
      </Button>
    </div>
  );
}

export default NucleiTabContent;

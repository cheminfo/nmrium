import { useFormikContext } from 'formik';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../../elements/Button';
import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikCheckBox from '../../../elements/formik/FormikCheckBox';
import FormikInput from '../../../elements/formik/FormikInput';
import { InfoBlockField } from '../../../workspaces/Workspace';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
  },
  column: {
    padding: '2px',
  },
};

function InfoBlockTabContent() {
  const { values, setFieldValue } = useFormikContext();

  const fields = (values as any)?.infoBlock.fields;

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
      setFieldValue('infoBlock.fields', columns);
    },
    [setFieldValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setFieldValue('infoBlock.fields', _fields);
    },
    [setFieldValue],
  );

  const COLUMNS: Column<InfoBlockField>[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Field',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`infoBlock.fields.${row.index}.jpath`}
              style={{ input: styles.input }}
            />
          );
        },
      },
      {
        Header: 'Visible',
        style: { width: '30px', ...styles.column },
        Cell: ({ row }) => (
          <CheckBoxCell
            name={`infoBlock.fields.${row.index}.visible`}
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
    [addHandler, deleteHandler],
  );

  return (
    <div>
      <Label
        title="Display spectra info block"
        htmlFor="infoBlock.visible"
        style={{ wrapper: { padding: '10px 0' } }}
      >
        <FormikCheckBox name="infoBlock.visible" />
      </Label>

      <GroupPane
        text="Fields"
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
          emptyDataRowText="No Fields"
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
        Add Field
      </Button.Done>
    </div>
  );
}

export default InfoBlockTabContent;

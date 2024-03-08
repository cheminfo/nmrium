import { v4 } from '@lukeed/uuid';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { Peak1D } from 'nmr-processing';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import Button from '../../../../elements/Button';
import ReactTable, { Column } from '../../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../../elements/formik/FormikInput';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
    padding: '0.25rem 0.5rem',
  },
  column: {
    padding: '2px',
  },
};

export default function PeaksTable() {
  const { values, setFieldValue } = useFormikContext<any>();

  const peaks = lodashGet(values, `signals[${values.activeTab}].peaks`, []);

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: any[] = [];
      const peak: Peak1D = {
        id: v4(),
        x: 0,
        y: 0,
        originalX: 0,
        width: 0,
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), peak, ...data.slice(index)];
      } else {
        columns.push(peak);
      }
      void setFieldValue(`signals[${values.activeTab}].peaks`, columns);
    },
    [setFieldValue, values.activeTab],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const peaks = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue(`signals[${values.activeTab}].peaks`, peaks);
    },
    [setFieldValue, values.activeTab],
  );

  function deleteAllHandler() {
    void setFieldValue(`signals[${values.activeTab}].peaks`, []);
  }

  const COLUMNS: Array<Column<any>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'delta',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`signals.${values.activeTab}.peaks.${row.index}.x`}
              style={{ input: styles.input }}
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '70px', ...styles.column },
        id: 'action-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {!record?.name && (
                <Button.Danger
                  fill="outline"
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaRegTrashAlt />
                </Button.Danger>
              )}
            </div>
          );
        },
      },
    ],
    [deleteHandler, values.activeTab],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '5px 0', display: 'flex' }}>
        <Toolbar>
          <Toolbar.Item
            icon={<FaPlus />}
            title="Add a new peak"
            intent="success"
            onClick={() => addHandler(peaks, 0)}
          />
          <Toolbar.Item
            icon={<FaRegTrashAlt />}
            title="Delete all peaks"
            intent="danger"
            onClick={deleteAllHandler}
          />
        </Toolbar>
      </div>
      <div
        style={{
          maxHeight: '300px',
          overflow: 'auto',
        }}
      >
        <ReactTable
          data={peaks}
          columns={COLUMNS}
          emptyDataRowText="No peaks"
        />
      </div>
    </div>
  );
}

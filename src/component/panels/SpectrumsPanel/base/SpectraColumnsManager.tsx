import { useFormikContext } from 'formik';
import { useMemo, CSSProperties } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../../elements/Button';
import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../elements/formik/FormikInput';
import {
  PanelsPreferences,
  SpectraTableColumn,
} from '../../../workspaces/Workspace';

const style: CSSProperties = {
  width: '100%',
  fontSize: '1.1em',
  textAlign: 'left',
  padding: '0.1em 0.1em',
};

const inputStyle: CSSProperties = {
  border: 'none',
};

interface SpectraColumnsManagerProps {
  nucleus: string;
  onAdd: (nucleus: string, index: number) => void;
  onDelete: (nucleus: string, index: number) => void;
}

export function SpectraColumnsManager({
  nucleus,
  onAdd,
  onDelete,
}: SpectraColumnsManagerProps) {
  const { values: nucleiPreferences } =
    useFormikContext<PanelsPreferences['spectra']>();

  const COLUMNS: Column<SpectraTableColumn>[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'column',
        Cell: ({ row }) => {
          const column: any = row.original;

          if (column?.name) {
            return <span style={style}>{column?.label}</span>;
          }

          return (
            <FormikInput
              name={`nuclei.${nucleus}.columns.${row.index}.jpath`}
              style={{ input: { ...style, ...inputStyle } }}
            />
          );
        },
      },
      {
        Header: 'Label',
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${nucleus}.columns.${row.index}.label`}
              style={{ input: { ...style, ...inputStyle } }}
            />
          );
        },
      },
      {
        Header: 'Visible',
        style: { width: '30px' },
        Cell: ({ row }) => (
          <CheckBoxCell
            name={`nuclei.${nucleus}.columns.${row.index}.visible`}
            defaultValue
          />
        ),
      },
      {
        Header: '',
        style: { width: '30px' },
        id: 'add-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex' }}>
              {!record?.name && (
                <Button.Danger
                  fill="outline"
                  onClick={() => onDelete(nucleus, row.index)}
                >
                  <FaTimes />
                </Button.Danger>
              )}
              {data.length === row.index + 1 && (
                <Button.Done
                  fill="outline"
                  onClick={() => onAdd(nucleus, row.index + 1)}
                >
                  <FaPlus />
                </Button.Done>
              )}
            </div>
          );
        },
      },
    ],
    [nucleus, onAdd, onDelete],
  );

  return (
    <ReactTable
      data={nucleiPreferences.nuclei[nucleus].columns}
      columns={COLUMNS}
    />
  );
}

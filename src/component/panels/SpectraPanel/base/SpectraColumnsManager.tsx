import { useFormikContext } from 'formik';
import { PanelsPreferences, SpectraTableColumn } from 'nmr-load-save';
import { useMemo } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../../elements/Button';
import { CheckBoxCell } from '../../../elements/CheckBoxCell';
import { InputStyle } from '../../../elements/Input';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import FormikInput, {
  InputMapValueFunctions,
} from '../../../elements/formik/FormikInput';

const inputStyle: InputStyle = {
  input: {
    width: '100%',
    fontSize: '1.1em',
    textAlign: 'left',
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    padding: '0.25rem 0.5rem',
    borderRadius: 0,
    borderColor: 'white',
  },
};

interface SpectraColumnsManagerProps extends InputMapValueFunctions {
  nucleus: string;
  onAdd: (nucleus: string, index: number) => void;
  onDelete: (nucleus: string, index: number) => void;
  datalist?: string[];
}

export function SpectraColumnsManager({
  nucleus,
  onAdd,
  onDelete,
  datalist,
  mapOnChangeValue,
  mapValue,
}: SpectraColumnsManagerProps) {
  const { values: nucleiPreferences } =
    useFormikContext<PanelsPreferences['spectra']>();

  const COLUMNS: Array<Column<SpectraTableColumn>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Label',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`nuclei.${nucleus}.columns.${row.index}.label`}
            />
          );
        },
      },
      {
        Header: 'Column',
        style: { padding: 0 },
        Cell: ({ row }) => {
          const column: any = row.original;

          if (column?.name) {
            return (
              <span
                style={{
                  ...inputStyle.input,
                  padding: '0.25rem 0.5rem',
                }}
              >
                {column?.jpath?.join('.') || column.description}
              </span>
            );
          }

          return (
            <FormikInput
              name={`nuclei.${nucleus}.columns.${row.index}.jpath`}
              style={inputStyle}
              datalist={datalist}
              mapOnChangeValue={mapOnChangeValue}
              mapValue={mapValue}
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
        style: { width: '80px' },
        id: 'add-button',
        Cell: ({ row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button.Done
                fill="outline"
                onClick={() => onAdd(nucleus, row.index + 1)}
              >
                <FaPlus />
              </Button.Done>
              {!record?.name && (
                <Button.Danger
                  fill="outline"
                  onClick={() => onDelete(nucleus, row.index)}
                >
                  <FaTimes />
                </Button.Danger>
              )}
            </div>
          );
        },
      },
    ],
    [datalist, mapOnChangeValue, mapValue, nucleus, onAdd, onDelete],
  );

  return (
    <ReactTable
      data={nucleiPreferences.nuclei[nucleus]?.columns || []}
      columns={COLUMNS}
    />
  );
}

import { Checkbox, Classes } from '@blueprintjs/core';
import { SpectraTableColumn } from 'nmr-load-save';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { InputStyle } from '../../../elements/Input.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable.js';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString.js';

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

function getObjectKey(
  nucleus: string,
  index: number,
  key: keyof SpectraTableColumn,
) {
  return `nuclei.${nucleus}.columns.${index}.${key}`;
}

interface SpectraColumnsManagerProps {
  nucleus: string;
  onAdd: (nucleus: string, index: number) => void;
  onDelete: (nucleus: string, index: number) => void;
  datalist?: string[];
  mapOnChangeValue: (value: string) => string;
}

export function SpectraColumnsManager({
  nucleus,
  onAdd,
  onDelete,
  datalist,
  mapOnChangeValue,
}: SpectraColumnsManagerProps) {
  const { control, getValues, register } = useFormContext();

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
          const name = getObjectKey(nucleus, row.index, 'label');
          return (
            <Input2Controller
              control={control}
              name={name}
              style={{ backgroundColor: 'transparent' }}
              noShadowBox
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
          const name = getObjectKey(nucleus, row.index, 'jpath');
          return (
            <Input2Controller
              control={control}
              name={name}
              filterItems={datalist}
              mapOnChangeValue={mapOnChangeValue}
              mapValue={convertPathArrayToString}
              style={{ backgroundColor: 'transparent' }}
              noShadowBox
            />
          );
        },
      },
      {
        Header: 'Visible',
        style: { width: '30px', textAlign: 'center' },
        Cell: ({ row }) => (
          <Checkbox
            style={{ margin: 0 }}
            {...register(getObjectKey(nucleus, row.index, 'visible'))}
          />
        ),
      },
      {
        Header: '',
        style: { width: '65px' },
        id: 'op-buttons',
        Cell: ({ row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                small
                intent="success"
                outlined
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => onAdd(nucleus, row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              {!record?.name && (
                <Button
                  small
                  outlined
                  intent="danger"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => onDelete(nucleus, row.index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [control, datalist, mapOnChangeValue, nucleus, onAdd, onDelete, register],
  );

  return (
    <ReactTable
      data={getValues().nuclei[nucleus]?.columns || []}
      columns={COLUMNS}
      rowStyle={{
        hover: { backgroundColor: '#f7f7f7' },
        active: { backgroundColor: '#f5f5f5' },
      }}
    />
  );
}

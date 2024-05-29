import { Checkbox, Classes } from '@blueprintjs/core';
import lodashGet from 'lodash/get';
import { SpectraTableColumn } from 'nmr-load-save';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { InputStyle } from '../../../elements/Input';
import { Input2 } from '../../../elements/Input2';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { convertPathArrayToString } from '../../../utility/convertPathArrayToString';
import { Button } from 'react-science/ui';

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
  mapOnChangeValue: (value: string | number) => string;
}

export function SpectraColumnsManager({
  nucleus,
  onAdd,
  onDelete,
  datalist,
  mapOnChangeValue,
}: SpectraColumnsManagerProps) {
  const {
    control,
    getValues,
    register,
    formState: { errors },
  } = useFormContext();

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
          const isNotValid = lodashGet(errors, name, false);

          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <Input2
                    {...field}
                    onChange={(v, e) => field.onChange(e)}
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                  />
                );
              }}
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
          const isNotValid = lodashGet(errors, name, false);
          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <Input2
                    FilterItems={datalist}
                    onChange={(value) =>
                      field.onChange(mapOnChangeValue(value))
                    }
                    value={convertPathArrayToString(field.value)}
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                  />
                );
              }}
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
    [
      control,
      datalist,
      errors,
      mapOnChangeValue,
      nucleus,
      onAdd,
      onDelete,
      register,
    ],
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

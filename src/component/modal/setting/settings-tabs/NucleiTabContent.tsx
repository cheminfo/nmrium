import { Classes } from '@blueprintjs/core';
import { NucleiPreferences } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { GroupPane } from '../../../elements/GroupPane';
import { Input2 } from '../../../elements/Input2';
import { NumberInput2 } from '../../../elements/NumberInput2';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import { useFormValidateField } from '../../../elements/useFormValidateField';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';

function getKeyPath<T extends keyof NucleiPreferences>(
  index: number,
  key: T,
): `nuclei.${number}.${T}` {
  return `nuclei.${index}.${key}`;
}

function NucleiTabContent() {
  const { control, setValue } = useFormContext<WorkspaceWithSource>();
  const isValid = useFormValidateField();

  const fields: NucleiPreferences[] =
    useWatch({
      name: 'nuclei',
    }) || [];

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
      setValue('nuclei', columns);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setValue('nuclei', _fields);
    },
    [setValue],
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
          const name = getKeyPath(row.index, 'nucleus');
          const isNotValid = !isValid(name);

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
        Header: 'δ (ppm)',
        style: { padding: 0 },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'ppmFormat');
          const isNotValid = !isValid(name);

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
        Header: 'Coupling (Hz)',
        style: { padding: 0 },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'hzFormat');
          const isNotValid = !isValid(name);

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
        Header: 'Axis from',
        style: { padding: 0 },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'axisFrom');
          const isNotValid = !isValid(name);

          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <NumberInput2
                    allowNumericCharactersOnly
                    value={field.value}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onValueChange={(valueAsNumber, valueAsString, element) =>
                      field.onChange(valueAsNumber)
                    }
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                    fill
                  />
                );
              }}
            />
          );
        },
      },
      {
        Header: 'Axis to',
        style: { padding: 0 },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'axisTo');
          const isNotValid = !isValid(name);

          return (
            <Controller
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <NumberInput2
                    allowNumericCharactersOnly
                    value={field.value}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onValueChange={(valueAsNumber, valueAsString, element) =>
                      field.onChange(valueAsNumber)
                    }
                    style={{
                      ...(!isNotValid && { boxShadow: 'none' }),
                      backgroundColor: 'transparent',
                    }}
                    intent={isNotValid ? 'danger' : 'none'}
                    fill
                  />
                );
              }}
            />
          );
        },
      },

      {
        Header: '',
        style: { width: '60px' },
        id: 'op-buttons',
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
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => deleteHandler(data, row.index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>
            </div>
          );
        },
      },
    ],
    [addHandler, control, deleteHandler, isValid],
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

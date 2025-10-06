import { Classes } from '@blueprintjs/core';
import type { NucleiPreferences } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import type { CellProps } from 'react-table';

import { GroupPane } from '../../../elements/GroupPane.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { Section } from '../GeneralSettings.js';

function getKeyPath<T extends keyof NucleiPreferences>(
  index: number,
  key: T,
): `nuclei.${number}.${T}` {
  return `nuclei.${index}.${key}`;
}

export default function NucleiTabContent() {
  const { control, setValue, watch } = useFormContext<WorkspaceWithSource>();

  const fields: NucleiPreferences[] = watch('nuclei') || [];

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
    (data: any, index: number) => {
      const _fields = data.filter(
        (_: any, columnIndex: any) => columnIndex !== index,
      );
      setValue('nuclei', _fields);
    },
    [setValue],
  );

  const COLUMNS = useMemo<Array<Column<NucleiPreferences>>>(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Nucleus',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<NucleiPreferences>) => {
          const name = getKeyPath(row.index, 'nucleus');
          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
            />
          );
        },
      },
      {
        Header: 'δ (ppm)',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<NucleiPreferences>) => {
          const name = getKeyPath(row.index, 'ppmFormat');
          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
            />
          );
        },
      },
      {
        Header: 'Coupling (Hz)',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<NucleiPreferences>) => {
          const name = getKeyPath(row.index, 'hzFormat');

          return (
            <Input2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
            />
          );
        },
      },
      {
        Header: 'Axis from',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<NucleiPreferences>) => {
          const name = getKeyPath(row.index, 'axisFrom');
          return (
            <NumberInput2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              fill
            />
          );
        },
      },
      {
        Header: 'Axis to',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<NucleiPreferences>) => {
          const name = getKeyPath(row.index, 'axisTo');

          return (
            <NumberInput2Controller
              control={control}
              name={name}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              fill
            />
          );
        },
      },

      {
        Header: '',
        style: { width: '60px' },
        id: 'op-buttons',
        Cell: ({ data, row }: CellProps<NucleiPreferences>) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                variant="outlined"
                intent="success"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="outlined"
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
    [addHandler, control, deleteHandler],
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

interface FieldsBlockHeaderProps {
  onAdd: () => void;
  text: string;
}

function FieldsBlockHeader(props: FieldsBlockHeaderProps) {
  const { onAdd, text } = props;
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>

      <Button
        size="small"
        variant="outlined"
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add nuclei preferences
      </Button>
    </Section>
  );
}

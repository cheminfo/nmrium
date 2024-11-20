import { Classes } from '@blueprintjs/core';
import type { ExternalAPI } from 'nmr-load-save';
import { EXTERNAL_API_KEYS } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { GroupPane } from '../../../elements/GroupPane.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import { Select2Controller } from '../../../elements/Select2Controller.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { Section } from '../GeneralSettings.js';

function getKeyPath<T extends keyof ExternalAPI>(
  index: number,
  key: T,
): `externalAPIs.${number}.${T}` {
  return `externalAPIs.${index}.${key}`;
}

export function ExternalAPIsTabContent() {
  const { control, setValue, watch } = useFormContext<WorkspaceWithSource>();

  const fields: ExternalAPI[] = watch('externalAPIs') || [];

  const addHandler = useCallback(
    (data: readonly any[], index: number) => {
      let columns: any[] = [];
      const emptyField = {
        key: '',
        serverLink: '',
        APIKey: '',
      };
      if (data && Array.isArray(data)) {
        columns = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        columns.push(emptyField);
      }
      setValue('externalAPIs', columns);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const _fields = data.filter((_, columnIndex) => columnIndex !== index);
      setValue('externalAPIs', _fields);
    },
    [setValue],
  );

  const COLUMNS: Column[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Service',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'key');
          return (
            <Select2Controller<
              { key: string; description: string },
              WorkspaceWithSource
            >
              placeholder="Select API provider"
              control={control}
              name={name}
              items={[...EXTERNAL_API_KEYS]}
              itemTextKey="description"
              itemValueKey="key"
              fill
            />
          );
        },
      },
      {
        Header: 'Server link',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'serverLink');
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
        Header: 'API key',
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'APIKey');
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
        Header: '',
        style: { width: '60px' },
        id: 'op-buttons',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                small
                intent="success"
                outlined
                onClick={() => addHandler(data, row.index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              {!record?.name && (
                <Button
                  small
                  outlined
                  intent="danger"
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [addHandler, control, deleteHandler],
  );

  return (
    <GroupPane
      text="External APIs"
      renderHeader={(text) => {
        return <Header text={text} onAdd={() => addHandler(fields, 0)} />;
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
        emptyDataRowText="No external APIs"
      />
    </GroupPane>
  );
}

function Header({ onAdd, text }) {
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>

      <Button
        outlined
        small
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add an external API
      </Button>
    </Section>
  );
}

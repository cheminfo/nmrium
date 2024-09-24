/** @jsxImportSource @emotion/react */
import { Checkbox, Classes, Radio } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { CustomWorkspaces, Database } from 'nmr-load-save';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt, FaLink } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { GroupPane } from '../../../elements/GroupPane';
import { Input2Controller } from '../../../elements/Input2Controller';
import ReactTable, { Column } from '../../../elements/ReactTable/ReactTable';
import type { NMRiumWorkspace } from '../../../main';
import { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer';
import { getPreferencesByWorkspace } from '../../../reducer/preferences/utilities/getPreferencesByWorkspace';
import { isGoogleDocument } from '../../../utility/isGoogleDocument';
import { Section } from '../GeneralSettings';

function getKeyPath<T extends keyof Database>(
  index: number,
  key: T,
): `databases.data.${number}.${T}` {
  return `databases.data.${index}.${key}`;
}

interface DatabasesTabContentProps {
  currentWorkspace: NMRiumWorkspace;
  originalWorkspaces: CustomWorkspaces;
}

function DatabasesTabContent({
  currentWorkspace,
  originalWorkspaces,
}: DatabasesTabContentProps) {
  const { setValue, register, control } = useFormContext<WorkspaceWithSource>();

  const databases: Database[] =
    useWatch<WorkspaceWithSource>({
      name: 'databases.data',
    }) || [];

  const addHandler = useCallback(
    (data: readonly any[], index = 0) => {
      let databases: any[] = [];
      const emptyField = {
        key: v4(),
        label: '',
        url: '',
        enabled: true,
      };
      if (data && Array.isArray(data)) {
        databases = [...data.slice(0, index), emptyField, ...data.slice(index)];
      } else {
        databases.push(emptyField);
      }
      setValue('databases.data', databases);
    },
    [setValue],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const databases = data.filter((_, columnIndex) => columnIndex !== index);
      setValue('databases.data', databases);
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
        Header: 'Label',
        style: { minWidth: '150px' },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'label');
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
        Header: 'URL',
        style: { width: '100%' },
        Cell: ({ row }) => {
          const name = getKeyPath(row.index, 'url');
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
        Header: 'Enabled',
        style: { width: '30px', textAlign: 'center' },

        Cell: ({ row }) => (
          <Checkbox
            style={{ margin: 0 }}
            {...register(getKeyPath(row.index, 'enabled'))}
          />
        ),
      },
      {
        Header: 'Auto Load',
        style: { width: '30px', textAlign: 'center' },
        Cell: ({ row }) => (
          <Controller
            control={control}
            name="databases.defaultDatabase"
            render={({ field }) => {
              const { onChange, value } = field;
              return (
                <Radio
                  value={row.original.key}
                  style={{ margin: 0 }}
                  checked={value === row.original.key}
                  onChange={onChange}
                />
              );
            }}
          />
        ),
      },
      {
        Header: '',
        style: { maxWidth: '100px', width: '85px' },
        id: 'op-buttons',
        Cell: ({ data, row }) => {
          const { index, original: record } = row;
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '0 3px',
              }}
            >
              <Button
                small
                intent="success"
                outlined
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                small
                outlined
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => deleteHandler(data, index)}
                css={css`
                  margin: 0 3px;
                `}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>

              {isGoogleDocument(record.url) && (
                <Button
                  small
                  outlined
                  intent="primary"
                  onClick={() => window.open(record.url, '_blank')}
                  tooltipProps={{ content: 'Open document', compact: true }}
                >
                  <FaLink className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [addHandler, control, deleteHandler, register],
  );

  function resetHandler() {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      currentWorkspace,
      originalWorkspaces,
    );
    const database = workSpaceDisplayPreferences.databases.data;

    setValue('databases.data', database);
  }
  return (
    <GroupPane
      text="Databases"
      renderHeader={(text) => {
        return (
          <DataBaseHeader
            text={text}
            onReset={resetHandler}
            onAdd={() => addHandler(databases)}
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
        data={databases}
        columns={COLUMNS}
        emptyDataRowText="No Fields"
      />
    </GroupPane>
  );
}

function DataBaseHeader({ onReset, onAdd, text }) {
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          small
          minimal
          intent="danger"
          tooltipProps={{ content: '', disabled: true }}
          onClick={onReset}
        >
          Reset Databases
        </Button>

        <Button
          small
          outlined
          intent="success"
          tooltipProps={{ content: '', disabled: true }}
          onClick={onAdd}
        >
          Add Database
        </Button>
      </div>
    </Section>
  );
}

export default DatabasesTabContent;

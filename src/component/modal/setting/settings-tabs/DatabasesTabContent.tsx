import { Checkbox, Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CustomWorkspaces, Database } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FaLink, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import type { CellProps } from 'react-table';

import { GroupPane } from '../../../elements/GroupPane.js';
import { Input2Controller } from '../../../elements/Input2Controller.js';
import type { Column } from '../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../elements/ReactTable/ReactTable.js';
import type { NMRiumWorkspace } from '../../../main/index.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.js';
import { getPreferencesByWorkspace } from '../../../reducer/preferences/utilities/getPreferencesByWorkspace.js';
import { isGoogleDocument } from '../../../utility/isGoogleDocument.js';
import { Section } from '../general_settings.js';

const StyledButton = styled(Button, {
  shouldForwardProp(propName) {
    return propName !== 'marginHorizontal';
  },
})<{ marginHorizontal: number }>`
  margin: 0 ${({ marginHorizontal }) => marginHorizontal}px;
`;

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

export default function DatabasesTabContent({
  currentWorkspace,
  originalWorkspaces,
}: DatabasesTabContentProps) {
  const { setValue, register, control, watch } =
    useFormContext<WorkspaceWithSource>();

  const databases: Database[] = watch('databases.data') || [];

  const addHandler = useCallback(
    (data: readonly any[], index = 0) => {
      let databases: any[] = [];
      const emptyField = {
        key: crypto.randomUUID(),
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
    (data: any, index: number) => {
      const databases = data.filter(
        (_: any, columnIndex: any) => columnIndex !== index,
      );
      setValue('databases.data', databases);
    },
    [setValue],
  );

  const COLUMNS = useMemo<Array<Column<Database>>>(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Label',
        style: { minWidth: '150px' },
        Cell: ({ row }: CellProps<Database>) => {
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
        Cell: ({ row }: CellProps<Database>) => {
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

        Cell: ({ row }: CellProps<Database>) => (
          <Checkbox
            style={{ margin: 0 }}
            {...register(getKeyPath(row.index, 'enabled'))}
          />
        ),
      },
      {
        Header: 'Auto Load',
        style: { width: '30px', textAlign: 'center' },
        Cell: ({ row }: CellProps<Database>) => (
          <Controller
            control={control}
            name="databases.defaultDatabase"
            render={({ field }) => {
              const { value, name } = field;
              const databaseKey = row.original.key;

              return (
                <Checkbox
                  name={name}
                  value={databaseKey}
                  style={{ margin: 0 }}
                  checked={value === databaseKey}
                  onChange={() => {
                    setValue(name, databaseKey === value ? '' : databaseKey);
                  }}
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
        Cell: ({ data, row }: CellProps<Database>) => {
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
                size="small"
                intent="success"
                variant="outlined"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => addHandler(data, index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <StyledButton
                marginHorizontal={3}
                size="small"
                variant="outlined"
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={() => deleteHandler(data, index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </StyledButton>

              {isGoogleDocument(record.url) && (
                <Button
                  size="small"
                  variant="outlined"
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
    [addHandler, control, deleteHandler, register, setValue],
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

interface DataBaseHeaderProps {
  onReset: () => void;
  onAdd: () => void;
  text: string;
}

function DataBaseHeader(props: DataBaseHeaderProps) {
  const { onReset, onAdd, text } = props;
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          variant="minimal"
          intent="danger"
          tooltipProps={{ content: '', disabled: true }}
          onClick={onReset}
        >
          Reset Databases
        </Button>

        <Button
          size="small"
          variant="outlined"
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

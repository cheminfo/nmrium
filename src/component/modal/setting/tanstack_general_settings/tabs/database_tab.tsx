import { Checkbox, Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaLink, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';

import { usePreferences } from '../../../../context/PreferencesContext.tsx';
import { GroupPane } from '../../../../elements/GroupPane.tsx';
import { Input2 } from '../../../../elements/Input2.tsx';
import type { Column } from '../../../../elements/ReactTable/ReactTable.tsx';
import ReactTable from '../../../../elements/ReactTable/ReactTable.tsx';
import { getPreferencesByWorkspace } from '../../../../reducer/preferences/utilities/getPreferencesByWorkspace.ts';
import { isGoogleDocument } from '../../../../utility/isGoogleDocument.ts';
import { Section } from '../../general_settings.tsx';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

interface DatabaseFormElement {
  key: string;
  label: string;
  url: string;
  enabled: boolean;
}

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 3px;
`;

const StyledButton = styled(Button, {
  shouldForwardProp(propName) {
    return propName !== 'marginHorizontal';
  },
})<{ marginHorizontal: number }>`
  margin: 0 ${({ marginHorizontal }) => marginHorizontal}px;
`;

const emptyDatabaseFormElement: DatabaseFormElement = {
  key: crypto.randomUUID(),
  label: '',
  url: '',
  enabled: true,
};

export const DatabaseTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const {
      originalWorkspaces,
      workspace: { current: workspaceName },
    } = usePreferences();

    const databases = useStore(
      form.store,
      (state) => state.values.databases.data,
    );

    const handleDelete = useCallback(
      (
        data: readonly DatabaseFormElement[],
        formElement: DatabaseFormElement,
      ) => {
        const databases = data.filter((element) => {
          return element.key !== formElement.key;
        });

        form.setFieldValue('databases.data', databases);
      },
      [form],
    );

    const handleAdd = useCallback(
      (data: readonly DatabaseFormElement[], index: number) => {
        let databases: DatabaseFormElement[] = [];

        if (data) {
          databases = [
            ...data.slice(0, index),
            emptyDatabaseFormElement,
            ...data.slice(index),
          ];
        } else {
          databases.push(emptyDatabaseFormElement);
        }

        form.setFieldValue('databases.data', databases);
      },
      [form],
    );

    const handleReset = useCallback(() => {
      const workSpaceDisplayPreferences = getPreferencesByWorkspace(
        workspaceName,
        originalWorkspaces,
      );

      form.setFieldValue('databases', workSpaceDisplayPreferences.databases);
    }, [form, originalWorkspaces, workspaceName]);

    const COLUMNS = useMemo<Array<Column<DatabaseFormElement>>>(() => {
      return [
        {
          Header: 'Label',
          style: { minWidth: '150px' },
          Cell: ({ row: { index } }: CellProps<DatabaseFormElement>) => {
            return (
              <form.Field key={index} name={`databases.data[${index}].label`}>
                {(subField) => (
                  <Input2
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={subField.state.value}
                    onChange={subField.handleChange}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'URL',
          style: { width: '100%' },
          Cell: ({ row: { index } }: CellProps<DatabaseFormElement>) => {
            return (
              <form.Field key={index} name={`databases.data[${index}].url`}>
                {(subField) => (
                  <Input2
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={subField.state.value}
                    onChange={subField.handleChange}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'Enabled',
          style: { width: '30px', textAlign: 'center' },
          Cell: ({ row: { index } }: CellProps<DatabaseFormElement>) => {
            return (
              <form.Field key={index} name={`databases.data[${index}].enabled`}>
                {(subField) => (
                  <Checkbox
                    checked={subField.state.value}
                    value={String(subField.state.value)}
                    onChange={(event) => {
                      subField.handleChange(event.currentTarget.checked);
                    }}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'Auto Load',
          style: { width: '30px', textAlign: 'center' },
          Cell: ({
            row: {
              index,
              original: { key },
            },
          }: CellProps<DatabaseFormElement>) => {
            return (
              <form.Field key={index} name={`databases.defaultDatabase`}>
                {(subField) => (
                  <Checkbox
                    style={{ margin: 0 }}
                    checked={subField.state.value === key}
                    value={String(subField.state.value === key)}
                    onChange={() => {
                      subField.handleChange(
                        subField.state.value === key ? '' : key,
                      );
                    }}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: '',
          style: { maxWidth: '100px', width: '85px' },
          id: 'op-buttons',
          Cell: ({
            row: { original, index: rowIndex },
            data,
          }: CellProps<DatabaseFormElement>) => {
            return (
              <Buttons>
                <Button
                  size="small"
                  intent="success"
                  variant="outlined"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleAdd(data, rowIndex + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                <StyledButton
                  marginHorizontal={3}
                  size="small"
                  variant="outlined"
                  intent="danger"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleDelete(data, original)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </StyledButton>

                {isGoogleDocument(original.url) && (
                  <Button
                    size="small"
                    variant="outlined"
                    intent="primary"
                    onClick={() => window.open(original.url, '_blank')}
                    tooltipProps={{ content: 'Open document', compact: true }}
                  >
                    <FaLink className={Classes.ICON} />
                  </Button>
                )}
              </Buttons>
            );
          },
        },
      ];
    }, [form, handleAdd, handleDelete]);

    return (
      <GroupPane
        text="Databases"
        renderHeader={(text) => {
          return (
            <DatabaseHeader
              text={text}
              handleReset={handleReset}
              handleAdd={() => handleAdd(databases, 0)}
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
  },
});

interface DatabaseHeaderProps {
  text: string;
  handleReset: () => void;
  handleAdd: () => void;
}

const DatabaseHeaderText = styled.p`
  flex: 1;
`;

const DatabaseHeaderButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

function DatabaseHeader(props: DatabaseHeaderProps) {
  const { text, handleReset, handleAdd } = props;

  return (
    <Section>
      <DatabaseHeaderText>{text}</DatabaseHeaderText>
      <DatabaseHeaderButtons>
        <Button
          size="small"
          variant="minimal"
          intent="danger"
          tooltipProps={{ content: '', disabled: true }}
          onClick={handleReset}
        >
          Reset Databases
        </Button>

        <Button
          size="small"
          variant="outlined"
          intent="success"
          tooltipProps={{ content: '', disabled: true }}
          onClick={handleAdd}
        >
          Add Database
        </Button>
      </DatabaseHeaderButtons>
    </Section>
  );
}

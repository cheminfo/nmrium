import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useField } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaLink, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';
import type { z } from 'zod';

import type { Column } from '../../../../elements/ReactTable/ReactTable.tsx';
import { isGoogleDocument } from '../../../../utility/isGoogleDocument.ts';
import {
  CellActions,
  CellCheckbox,
  CellInput,
  TableSettings,
} from '../ui/table.tsx';
import { TableSection } from '../ui/table_section.tsx';
import type { databasesValidation } from '../validation/database_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

type DatabaseForm = z.input<typeof databasesValidation>;
type DatabaseFormElement = DatabaseForm['data'][number];

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
    const field = useField({ form, name: 'databases.data', mode: 'array' });

    const handleDelete = useCallback(
      (formElement: DatabaseFormElement) => {
        const index = field.state.value.findIndex(
          (e) => e.key === formElement.key,
        );

        field.removeValue(index);
      },
      [field],
    );

    const handleAdd = useCallback(
      (index: number) => {
        field.insertValue(index, emptyDatabaseFormElement);
      },
      [field],
    );

    const handleReset = useCallback(() => {
      form.resetField('databases');
    }, [form]);

    const COLUMNS = useMemo<Array<Column<DatabaseFormElement>>>(() => {
      return [
        {
          Header: 'Label',
          style: { minWidth: '150px' },
          Cell: ({ row: { index } }: CellProps<DatabaseFormElement>) => {
            return (
              <form.Field key={index} name={`databases.data[${index}].label`}>
                {(subField) => (
                  <CellInput
                    onBlur={field.handleBlur}
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
                  <CellInput
                    onBlur={field.handleBlur}
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
                  <CellCheckbox
                    onBlur={field.handleBlur}
                    checked={subField.state.value}
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
                  <CellCheckbox
                    onBlur={field.handleBlur}
                    checked={subField.state.value === key}
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
          }: CellProps<DatabaseFormElement>) => {
            return (
              <CellActions>
                <Button
                  size="small"
                  intent="success"
                  variant="outlined"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleAdd(rowIndex + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                <StyledButton
                  marginHorizontal={3}
                  size="small"
                  variant="outlined"
                  intent="danger"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleDelete(original)}
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
              </CellActions>
            );
          },
        },
      ];
    }, [field.handleBlur, form, handleAdd, handleDelete]);

    return (
      <TableSection
        title="Databases"
        actions={
          <>
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
              onClick={() => handleAdd(0)}
            >
              Add Database
            </Button>
          </>
        }
      >
        <TableSettings
          data={field.state.value}
          columns={COLUMNS}
          emptyDataRowText="No Fields"
        />
      </TableSection>
    );
  },
});

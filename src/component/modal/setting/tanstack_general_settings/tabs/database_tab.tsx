import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { createColumnHelper } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { FaLink, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { z } from 'zod';

import { isGoogleDocument } from '../../../../utility/isGoogleDocument.ts';
import { CellActions, CellActionsButton } from '../ui/cell_actions.tsx';
import { CellCheckbox, CellCheckboxStyled } from '../ui/cell_checkbox.tsx';
import { CellInput } from '../ui/cell_input.tsx';
import { TableSettings } from '../ui/table.tsx';
import { TableSection } from '../ui/table_section.tsx';
import type { databasesValidation } from '../validation/database_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

type DatabaseForm = z.input<typeof databasesValidation>;
type DatabaseFormElement = DatabaseForm['data'][number];

function emptyDatabaseFormElement(): DatabaseFormElement {
  return {
    key: crypto.randomUUID(),
    label: '',
    url: '',
    enabled: true,
  };
}

export const DatabaseTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const field = useField({ form, name: 'databases.data', mode: 'array' });
    const { removeValue, insertValue } = field;
    const { resetField, Field } = form;

    const handleDelete = useCallback(
      (index: number) => {
        removeValue(index);
      },
      [removeValue],
    );

    const handleAdd = useCallback(
      (index: number) => {
        insertValue(index, emptyDatabaseFormElement());
      },
      [insertValue],
    );

    const handleReset = useCallback(() => {
      resetField('databases');
    }, [resetField]);

    const COLUMNS = useMemo(() => {
      const helper = createColumnHelper<DatabaseFormElement>();
      return [
        helper.accessor('label', {
          meta: {
            thStyle: {
              minWidth: '100px',
            },
          },
          cell: ({ row: { index } }) => (
            <Field key={index} name={`databases.data[${index}].label`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),
        helper.accessor('url', {
          header: 'URL',
          meta: {
            thStyle: {
              width: '100%',
            },
          },
          cell: ({ row: { index } }) => (
            <Field key={index} name={`databases.data[${index}].url`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),
        helper.accessor('enabled', {
          header: 'Enabled',
          cell: ({ row: { index } }) => (
            <Field key={index} name={`databases.data[${index}].enabled`}>
              {(field) => <CellCheckbox field={field} />}
            </Field>
          ),
        }),
        helper.display({
          id: 'defaultDatabase',
          header: 'Auto Load',
          cell: ({
            row: {
              index,
              original: { key },
            },
          }) => (
            <Field key={index} name="databases.defaultDatabase">
              {(subField) => (
                <CellCheckboxStyled
                  name={subField.name}
                  value={key}
                  checked={subField.state.value === key}
                  onChange={() => {
                    subField.handleChange(
                      subField.state.value === key ? '' : key,
                    );
                  }}
                  onBlur={subField.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        helper.display({
          id: 'actions',
          cell: ({ row: { index, original } }) => (
            <CellActions>
              <CellActionsButton
                intent="success"
                onClick={() => handleAdd(index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </CellActionsButton>
              <CellActionsButton
                intent="danger"
                onClick={() => handleDelete(index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </CellActionsButton>

              {isGoogleDocument(original.url) && (
                <CellActionsButton
                  intent="primary"
                  onClick={() => window.open(original.url, '_blank')}
                  tooltipProps={{ content: 'Open document', compact: true }}
                >
                  <FaLink className={Classes.ICON} />
                </CellActionsButton>
              )}
            </CellActions>
          ),
        }),
      ];
    }, [Field, handleAdd, handleDelete]);

    return (
      <TableSection
        title="Databases"
        actions={
          <>
            <Button
              size="small"
              variant="minimal"
              intent="danger"
              onClick={handleReset}
            >
              Reset Databases
            </Button>

            <Button
              size="small"
              variant="outlined"
              intent="success"
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
          getRowId={getRowId}
          emptyContent="No database item"
        />
      </TableSection>
    );
  },
});

function getRowId(row: DatabaseFormElement) {
  return row.key;
}

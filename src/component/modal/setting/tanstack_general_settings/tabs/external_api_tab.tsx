import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { createColumnHelper } from '@tanstack/react-table';
import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { z } from 'zod';

import { Select2 } from '../../../../elements/Select2.js';
import { CellActions, CellActionsButton } from '../ui/cell_actions.tsx';
import { CellInput } from '../ui/cell_input.tsx';
import { TableSettings } from '../ui/table.js';
import { TableSection } from '../ui/table_section.js';
import type { externalAPIWithUUIDValidation } from '../validation/external_apis_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

type API = z.input<typeof externalAPIWithUUIDValidation>;
function emptyApi(): API {
  return {
    uuid: crypto.randomUUID(),
    key: 'ct',
    name: '',
    description: '',
    apiUrl: '',
    apiKey: '',
  };
}

const itemsAPI = EXTERNAL_API_KEYS.slice();

export const ExternalApiTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function ExternalApiTab({ form }) {
    const { Field } = form;
    const field = useField({ form, name: 'externalAPIs', mode: 'array' });
    const { name, pushValue, insertValue, removeValue, state } = field;

    const columns = useMemo(() => {
      const helper = createColumnHelper<API>();
      return [
        helper.accessor('key', {
          header: 'Service',
          meta: {
            tdStyle: { width: '180px' },
          },
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].key`}>
              {(field) => (
                <Select2
                  items={itemsAPI}
                  itemValueKey="key"
                  itemTextKey="label"
                  selectedItemValue={field.state.value}
                  onItemSelect={({ key }) => field.handleChange(key)}
                  intent={!field.state.meta.isValid ? 'danger' : 'none'}
                  fill
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('name', {
          header: 'Name',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].name`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),
        helper.accessor('description', {
          header: 'Description',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].description`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),
        helper.accessor('apiUrl', {
          header: 'API link',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].apiUrl`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),

        helper.accessor('apiKey', {
          header: 'API key',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].apiKey`}>
              {(field) => <CellInput field={field} />}
            </Field>
          ),
        }),
        helper.display({
          id: 'actions',
          header: '',
          cell: ({ row: { index } }) => (
            <CellActions>
              <CellActionsButton
                intent="success"
                onClick={() => insertValue(index, emptyApi())}
              >
                <FaPlus className={Classes.ICON} />
              </CellActionsButton>
              <CellActionsButton
                intent="danger"
                onClick={() => removeValue(index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </CellActionsButton>
            </CellActions>
          ),
        }),
      ];
    }, [Field, insertValue, name, removeValue]);

    function onAddField() {
      pushValue(emptyApi());
    }

    return (
      <TableSection
        title="External APIs"
        actions={
          <Button
            size="small"
            variant="outlined"
            intent="success"
            onClick={onAddField}
          >
            Add an external API
          </Button>
        }
      >
        <TableSettings
          data={state.value}
          columns={columns}
          getRowId={getRowId}
          emptyContent="No external APIs"
        />
      </TableSection>
    );
  },
});

function getRowId(row: API) {
  return row.uuid;
}

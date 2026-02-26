import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { createColumnHelper } from '@tanstack/react-table';
import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { z } from 'zod';

import { Select2 } from '../../../../elements/Select2.js';
import {
  CellActions,
  CellActionsButton,
  CellInput,
  TableSettings,
} from '../ui/table.js';
import { TableSection } from '../ui/table_section.js';
import type { externalAPIValidation } from '../validation/external_apis_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

type API = z.input<typeof externalAPIValidation>;
const emptyApi: API = { key: 'CT', serverLink: '', APIKey: '' };

const itemsAPI = EXTERNAL_API_KEYS.slice();

export const ExternalApiTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function ExternalApiTab({ form }) {
    const { Field } = form;
    const field = useField({ form, name: 'externalAPIs', mode: 'array' });
    const { name, state, pushValue, insertValue, removeValue } = field;

    const columns = useMemo(() => {
      const helper = createColumnHelper<API>();
      return [
        helper.accessor('key', {
          header: 'Service',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].key`}>
              {(field) => (
                <Select2
                  items={itemsAPI}
                  itemValueKey="key"
                  itemTextKey="description"
                  selectedItemValue={field.state.value}
                  onItemSelect={({ key }) => field.handleChange(key)}
                  intent={!field.state.meta.isValid ? 'danger' : 'none'}
                  fill
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('serverLink', {
          header: 'Server link',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].serverLink`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  intent={
                    !field.state.meta.isValid && field.state.meta.isDirty
                      ? 'danger'
                      : 'none'
                  }
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('APIKey', {
          header: 'API key',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].APIKey`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  intent={
                    !field.state.meta.isValid && field.state.meta.isDirty
                      ? 'danger'
                      : 'none'
                  }
                />
              )}
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
                onClick={() => insertValue(index, emptyApi)}
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
      pushValue(emptyApi);
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
          emptyContent="No external APIs"
        />
      </TableSection>
    );
  },
});

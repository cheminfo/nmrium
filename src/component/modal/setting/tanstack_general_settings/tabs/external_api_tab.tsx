import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { EXTERNAL_API_KEYS } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';
import type { z } from 'zod';

import type { Column } from '../../../../elements/ReactTable/ReactTable.js';
import { Select2 } from '../../../../elements/Select2.js';
import { CellActions, CellInput, TableSettings } from '../ui/table.js';
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

    const columns = useMemo<Array<Column<API>>>(
      () => [
        {
          Header: '#',
          style: { minWidth: '2em', textAlign: 'center' },
          accessor: (_, index) => index + 1,
        },
        {
          Header: 'Service',
          Cell: ({ row: { index } }: CellProps<API>) => (
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
        },
        {
          Header: 'Server link',
          Cell: ({ row: { index } }: CellProps<API>) => (
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
        },
        {
          Header: 'API key',
          Cell: ({ row: { index } }: CellProps<API>) => (
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
        },
        {
          Header: '',
          style: { width: '60px' },
          id: 'add-button',
          Cell: ({ row: { index } }: CellProps<API>) => {
            return (
              <CellActions>
                <Button
                  size="small"
                  intent="success"
                  variant="minimal"
                  onClick={() => insertValue(index, emptyApi)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                <Button
                  size="small"
                  intent="danger"
                  variant="minimal"
                  onClick={() => removeValue(index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              </CellActions>
            );
          },
        },
      ],
      [Field, insertValue, name, removeValue],
    );

    function onAddField() {
      pushValue(emptyApi, { dontRunListeners: true });
    }

    return (
      <TableSection
        title="External APIs"
        actions={<Button onClick={onAddField}>Add an external API</Button>}
      >
        <TableSettings
          data={state.value}
          columns={columns}
          emptyDataRowText="No external APIs"
        />
      </TableSection>
    );
  },
});

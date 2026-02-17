import { Checkbox, Classes } from '@blueprintjs/core';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withFieldGroup, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';
import type { z } from 'zod';

import { useChartData } from '../../../../context/ChartContext.js';
import type { Column } from '../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../elements/ReactTable/ReactTable.js';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.js';
import {
  CellActions,
  CellCheckbox,
  CellInput,
  TableSettings,
  rowStyle,
  tableStyle,
} from '../ui/table.js';
import { TableSection } from '../ui/table_section.js';
import type { infoBlockFieldTabValidation } from '../validation/title_block_tab_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

export const TitleBlockTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    const { Section, AppField, pushFieldValue } = form;

    function onAddField() {
      pushFieldValue('infoBlock.fields', emptyField, {
        dontRunListeners: true,
      });
    }

    return (
      <>
        <Section title="Visibility">
          <AppField name="infoBlock.visible">
            {({ Checkbox }) => <Checkbox label="Display spectrum info block" />}
          </AppField>
        </Section>
        <TableSection
          title="Fields"
          actions={
            <Button
              size="small"
              variant="outlined"
              intent="primary"
              icon="plus"
              onClick={onAddField}
            >
              Add Field
            </Button>
          }
        >
          <Fields form={form} fields="infoBlock" />
        </TableSection>
      </>
    );
  },
});

type Field = z.input<typeof infoBlockFieldTabValidation>;
const emptyField: Field = {
  label: '',
  format: '',
  jpath: '',
  visible: true,
};
const Fields = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.infoBlock,
  render: function Fields({ group }) {
    const { Field, insertFieldValue, removeFieldValue } = group;
    const { data } = useChartData();
    const { datalist } = useMemo(() => getSpectraObjectPaths(data), [data]);

    const onAddRowAfter = useCallback(
      (index: number) => {
        void insertFieldValue(
          'fields',
          index + 1,
          { ...emptyField },
          { dontRunListeners: true },
        );
      },
      [insertFieldValue],
    );
    const onDeleteAt = useCallback(
      (index: number) => {
        void removeFieldValue('fields', index);
      },
      [removeFieldValue],
    );

    const columns = useMemo<Array<Column<Field>>>(
      () => [
        {
          Header: '#',
          style: { minWidth: '2em', textAlign: 'center' },
          accessor: (_, index) => index + 1,
        },
        {
          Header: 'Label',
          Cell: ({ row: { index } }: CellProps<Field>) => (
            <Field name={`fields[${index}].label`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </Field>
          ),
        },
        {
          Header: 'Field',
          Cell: ({ row }: CellProps<Field>) => {
            const rowIndex = row.index;

            return (
              <Field name={`fields[${rowIndex}].jpath`}>
                {(field) => (
                  <CellInput
                    name={field.name}
                    value={field.state.value}
                    onChange={field.handleChange}
                    filterItems={datalist}
                  />
                )}
              </Field>
            );
          },
        },
        {
          Header: 'Format',
          Cell: ({ row: { index } }: CellProps<Field>) => (
            <Field name={`fields[${index}].format`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </Field>
          ),
        },
        {
          Header: 'Visible',
          style: { width: '30px', textAlign: 'center' },
          Cell: ({ row: { index } }: CellProps<Field>) => (
            <Field name={`fields[${index}].visible`}>
              {(field) => (
                <CellCheckbox
                  name={field.name}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.checked)}
                />
              )}
            </Field>
          ),
        },
        {
          Header: '',
          style: { width: '60px' },
          id: 'add-button',
          Cell: ({ row: { index } }: CellProps<Field>) => {
            return (
              <CellActions>
                <Button
                  size="small"
                  intent="success"
                  variant="minimal"
                  onClick={() => onAddRowAfter(index)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                <Button
                  size="small"
                  intent="danger"
                  variant="minimal"
                  onClick={() => onDeleteAt(index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              </CellActions>
            );
          },
        },
      ],
      [Field, datalist, onAddRowAfter, onDeleteAt],
    );

    const fields = useStore(group.store, (state) => state.values.fields);

    return (
      <TableSettings
        data={fields}
        columns={columns}
        emptyDataRowText="No Fields"
      />
    );
  },
});

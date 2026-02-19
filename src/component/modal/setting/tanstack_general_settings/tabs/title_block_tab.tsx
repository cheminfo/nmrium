import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import {
  Button,
  TableDragRowHandler,
  createTableColumnHelper,
  withFieldGroup,
  withForm,
} from 'react-science/ui';
import type { z } from 'zod';

import { useChartData } from '../../../../context/ChartContext.js';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.js';
import {
  CellActions,
  CellCheckbox,
  CellInput,
  NewTableSettings,
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

    const columns = useMemo(() => {
      const columnHelper = createTableColumnHelper<Field>();
      return [
        columnHelper.display({
          id: 'dnd',
          header: '',
          meta: {
            tdStyle: { textAlign: 'center' },
          },
          cell: () => <TableDragRowHandlerStyled size="small" />,
        }),
        columnHelper.accessor('label', {
          header: () => 'Label',
          cell: ({ row: { index } }) => (
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
        }),
        columnHelper.accessor('jpath', {
          header: 'Field',
          cell: ({ row: { index } }) => (
            <Field name={`fields[${index}].jpath`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  filterItems={datalist}
                />
              )}
            </Field>
          ),
        }),
        columnHelper.accessor('format', {
          header: 'Format',
          cell: ({ row: { index } }) => (
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
        }),
        columnHelper.accessor('visible', {
          header: 'Visible',
          meta: {
            tdStyle: { textAlign: 'center' },
          },
          cell: ({ row: { index } }) => (
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
        }),
        columnHelper.display({
          id: 'actions',
          header: '',
          cell: ({ row: { index } }) => {
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
        }),
      ];
    }, [Field, datalist, onAddRowAfter, onDeleteAt]);

    const fields = useStore(group.store, (state) => state.values.fields);

    return (
      <NewTableSettings
        data={fields}
        columns={columns}
        onRowOrderChanged={(fields) => group.setFieldValue('fields', fields)}
        // emptyDataRowText="No Fields"
      />
    );
  },
});

const TableDragRowHandlerStyled = styled(TableDragRowHandler)`
  margin: 0 2px;
`;

import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useField, useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import {
  Button,
  TableDragRowHandler,
  createTableColumnHelper,
  withForm,
} from 'react-science/ui';
import type { z } from 'zod';

import { useChartData } from '../../../../context/ChartContext.js';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.js';
import {
  CellActions,
  CellActionsButton,
  CellCheckbox,
  CellInput,
  NewTableSettings,
} from '../ui/table.js';
import { TableSection } from '../ui/table_section.js';
import type { infoBlockFieldTabValidationWithUUID } from '../validation/title_block_tab_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

export const TitleBlockTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    const { Section, AppField, pushFieldValue } = form;

    function onAddField() {
      pushFieldValue('infoBlock.fields', getEmptyField(), {
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
          <Fields form={form} />
        </TableSection>
      </>
    );
  },
});

type Field = z.input<typeof infoBlockFieldTabValidationWithUUID>;
function getEmptyField(): Field {
  return {
    label: '',
    format: '',
    jpath: '',
    visible: true,
    uuid: crypto.randomUUID(),
  };
}
const Fields = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Fields({ form }) {
    const { Field } = form;
    const fields = useField({
      form,
      name: 'infoBlock.fields',
      mode: 'array',
    });
    const { insertValue, removeValue, setValue, name } = fields;

    const { data } = useChartData();
    const { datalist } = useMemo(() => getSpectraObjectPaths(data), [data]);

    const onAddRowAfter = useCallback(
      (index: number) => {
        insertValue(index + 1, getEmptyField(), { dontRunListeners: true });
      },
      [insertValue],
    );
    const onDeleteAt = useCallback(
      (index: number) => {
        removeValue(index);
      },
      [removeValue],
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
            <Field name={`${name}[${index}].label`}>
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
            <Field name={`${name}[${index}].jpath`}>
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
            <Field name={`${name}[${index}].format`}>
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
            <Field name={`${name}[${index}].visible`}>
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
          meta: {
            thStyle: {
              width: '60px',
            },
          },
          cell: ({ row: { index } }) => {
            return (
              <CellActions>
                <CellActionsButton
                  intent="success"
                  onClick={() => onAddRowAfter(index)}
                >
                  <FaPlus className={Classes.ICON} />
                </CellActionsButton>
                <CellActionsButton
                  intent="danger"
                  onClick={() => onDeleteAt(index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </CellActionsButton>
              </CellActions>
            );
          },
        }),
      ];
    }, [Field, datalist, name, onAddRowAfter, onDeleteAt]);

    const onRowOrderChanged = useCallback(
      (value: Field[]) => {
        setValue(value);
      },
      [setValue],
    );

    // It seems fields.setValue don't always trigger rerender
    // so fields.state.value can de-sync and cause weird behavior with DnD reorder.
    const fieldsData = useStore(fields.store, (s) => s.value);

    return (
      <NewTableSettings
        data={fieldsData}
        columns={columns}
        onRowOrderChanged={onRowOrderChanged}
        getRowId={getRowId}
        emptyContent="No Fields"
      />
    );
  },
});

function getRowId(row: Field) {
  return row.uuid;
}

const TableDragRowHandlerStyled = styled(TableDragRowHandler)`
  margin: 0 2px;
`;

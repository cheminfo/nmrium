import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useField, useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import {
  Button,
  FieldGroupSVGTextStyleFields,
  TableDragRowHandler,
  createTableColumnHelper,
  withForm,
} from 'react-science/ui';
import type { z } from 'zod';

import { useChartData } from '../../../../context/ChartContext.js';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.js';
import { CellActions, CellActionsButton } from '../ui/cell_actions.tsx';
import { CellCheckbox } from '../ui/cell_checkbox.tsx';
import { CellInput } from '../ui/cell_input.tsx';
import { TableSettings } from '../ui/table.js';
import { TableSection } from '../ui/table_section.js';
import type { spectraLabelFieldTabValidationWithUUID } from '../validation/spectra_label_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.js';

export const SpectraLabelTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    const { Section, AppField } = form;

    return (
      <>
        <Section title="Visibility">
          <AppField name="spectraLabel.visible">
            {({ Checkbox }) => <Checkbox label="Display spectra labels" />}
          </AppField>
        </Section>

        <TableFields form={form} />

        <Section title="Styling">
          <FieldGroupSVGTextStyleFields
            form={form}
            fields="spectraLabel.valueStyle"
            label="Field value"
            previewText="Placeholder"
          />
        </Section>
      </>
    );
  },
});

type Field = z.input<typeof spectraLabelFieldTabValidationWithUUID>;
function getEmptyField(): Field {
  return {
    format: '',
    jpath: '',
    visible: true,
    uuid: crypto.randomUUID(),
  };
}
const TableFields = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Fields({ form }) {
    const { Field } = form;
    const fields = useField({
      form,
      name: 'spectraLabel.fields',
      mode: 'array',
    });
    const { removeValue, setValue, pushValue, name, store } = fields;

    const [autoFocus, setAutoFocus] = useState<string>('');
    function onAddField() {
      const value = getEmptyField();
      pushValue(value, { dontRunListeners: true });
      setAutoFocus(value.uuid);
    }

    const { data } = useChartData();
    const { datalist } = useMemo(() => getSpectraObjectPaths(data), [data]);

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
        columnHelper.accessor('jpath', {
          header: 'Field',
          cell: ({ row: { index, original } }) => (
            <Field name={`${name}[${index}].jpath`}>
              {(field) => (
                <CellInput
                  field={field}
                  autoFocus={original.uuid === autoFocus ? true : undefined}
                  filterItems={datalist}
                  onBlur={() => setAutoFocus('')}
                />
              )}
            </Field>
          ),
        }),
        columnHelper.accessor('format', {
          header: 'Format',
          cell: ({ row: { index } }) => (
            <Field name={`${name}[${index}].format`}>
              {(field) => <CellInput field={field} />}
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
              {(field) => <CellCheckbox field={field} />}
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
    }, [Field, autoFocus, datalist, name, onDeleteAt]);

    const onRowOrderChanged = useCallback(
      (value: Field[]) => {
        setValue(value);
      },
      [setValue],
    );

    const fieldsData = useStore(store, (s) => s.value);

    return (
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
        <TableSettings
          data={fieldsData}
          columns={columns}
          onRowOrderChanged={onRowOrderChanged}
          getRowId={getRowId}
          emptyContent="No Fields"
        />
      </TableSection>
    );
  },
});

function getRowId(row: Field) {
  return row.uuid;
}

const TableDragRowHandlerStyled = styled(TableDragRowHandler)`
  margin: 0 2px;
`;

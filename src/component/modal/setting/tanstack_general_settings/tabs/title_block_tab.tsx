import { Checkbox, Classes } from '@blueprintjs/core';
import type { CSSObject } from '@emotion/react';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withFieldGroup, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';
import type { z } from 'zod';

import { useChartData } from '../../../../context/ChartContext.js';
import { Input2 } from '../../../../elements/Input2.js';
import type {
  BaseRowStyle,
  Column,
} from '../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../elements/ReactTable/ReactTable.js';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.js';
import type { infoBlockFieldTabValidation } from '../validation/title_block_tab_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

const TableSection = styled.section`
  margin-top: 15px;
  gap: 5px;
  display: flex;
  flex-direction: column;

  > header {
    display: flex;
    flex-direction: column;

    > h2 {
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.75rem;
    }
  }
`;

const TitleActions = styled.div`
  float: right;
  display: flex;
  gap: 0.5em;
`;

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
        <TableSection>
          <header>
            <h2>
              <TitleActions>
                <Button
                  size="small"
                  variant="outlined"
                  intent="primary"
                  icon="plus"
                  onClick={onAddField}
                >
                  Add Field
                </Button>
              </TitleActions>
              Fields
            </h2>
          </header>

          <Fields form={form} fields="infoBlock" />
        </TableSection>
      </>
    );
  },
});

const tableStyle: CSSObject = {
  'thead tr th': { zIndex: 1 },
  td: { padding: 0 },
};
const rowStyle: BaseRowStyle = {
  hover: { backgroundColor: '#f7f7f7' },
  active: { backgroundColor: '#f5f5f5' },
};

const CellInput = styled(Input2)`
  input {
    background-color: transparent;
    box-shadow: none;
  }
`;
const CellCheckbox = styled(Checkbox)`
  margin: 0;
`;
const Actions = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 0.25em;
`;

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
              <Actions>
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
              </Actions>
            );
          },
        },
      ],
      [Field, datalist, onAddRowAfter, onDeleteAt],
    );

    const fields = useStore(group.store, (state) => state.values.fields);

    return (
      <ReactTable
        style={tableStyle}
        rowStyle={rowStyle}
        data={fields}
        columns={columns}
        emptyDataRowText="No Fields"
      />
    );
  },
});

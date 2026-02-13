import { Classes, NumericInput } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';

import { GroupPane } from '../../../../elements/GroupPane.tsx';
import { Input2 } from '../../../../elements/Input2.tsx';
import type { Column } from '../../../../elements/ReactTable/ReactTable.tsx';
import ReactTable from '../../../../elements/ReactTable/ReactTable.tsx';
import { Section } from '../../general_settings.tsx';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

interface NucleiFormElement {
  nucleus: string;
  ppmFormat: string;
  hzFormat: string;
}

const emptyNucleiFormElement: NucleiFormElement = {
  nucleus: '',
  ppmFormat: '0.00',
  hzFormat: '0.00',
};

export const NucleiTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const fields = useStore(form.store, (state) => state.values.nuclei);

    const handleAdd = useCallback(
      (data: readonly NucleiFormElement[], index: number) => {
        let columns: NucleiFormElement[] = [];

        if (data) {
          columns = [
            ...data.slice(0, index),
            emptyNucleiFormElement,
            ...data.slice(index),
          ];
        } else {
          columns.push(emptyNucleiFormElement);
        }

        form.setFieldValue('nuclei', columns);
      },
      [form],
    );

    const handleDelete = useCallback(
      (data: readonly NucleiFormElement[], formElement: NucleiFormElement) => {
        const fields = data.filter((element) => {
          return element.nucleus !== formElement.nucleus;
        });

        form.setFieldValue('nuclei', fields);
      },
      [form],
    );

    const COLUMNS = useMemo<Array<Column<NucleiFormElement>>>(
      () => [
        {
          Header: 'Nucleus',
          style: { padding: 0 },
          Cell: ({ row: { index } }: CellProps<NucleiFormElement>) => {
            return (
              <form.Field key={index} name={`nuclei[${index}].nucleus`}>
                {(subField) => (
                  <Input2
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={subField.state.value}
                    onChange={subField.handleChange}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'δ (ppm)',
          style: { padding: 0 },
          Cell: ({ row: { index } }: CellProps<NucleiFormElement>) => {
            return (
              <form.Field key={index} name={`nuclei[${index}].ppmFormat`}>
                {(subField) => (
                  <Input2
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={subField.state.value}
                    onChange={subField.handleChange}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'Coupling (Hz)',
          style: { padding: 0 },
          Cell: ({ row: { index } }: CellProps<NucleiFormElement>) => {
            return (
              <form.Field key={index} name={`nuclei[${index}].hzFormat`}>
                {(subField) => (
                  <Input2
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={subField.state.value}
                    onChange={subField.handleChange}
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'Axis from',
          style: { padding: 0 },
          Cell: ({ row: { index } }: CellProps<NucleiFormElement>) => {
            return (
              <form.Field key={index} name={`nuclei[${index}].axisFrom`}>
                {(subField) => (
                  <NumericInput
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={Number(subField.state.value) || undefined}
                    fill
                    onValueChange={(valueAsNumber) =>
                      subField.handleChange(valueAsNumber)
                    }
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: 'Axis to',
          style: { padding: 0 },
          Cell: ({ row: { index } }: CellProps<NucleiFormElement>) => {
            return (
              <form.Field key={index} name={`nuclei[${index}].axisTo`}>
                {(subField) => (
                  <NumericInput
                    style={{
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    }}
                    value={Number(subField.state.value) || undefined}
                    fill
                    onValueChange={(valueAsNumber) =>
                      subField.handleChange(valueAsNumber)
                    }
                  />
                )}
              </form.Field>
            );
          },
        },
        {
          Header: '',
          style: {
            width: 60,
          },
          id: 'op-buttons',
          Cell: ({
            row: { original, index: rowIndex },
            data,
          }: CellProps<NucleiFormElement>) => {
            return (
              <Buttons>
                <Button
                  size="small"
                  variant="outlined"
                  intent="success"
                  onClick={() => handleAdd(data, rowIndex + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  intent="danger"
                  onClick={() => handleDelete(data, original)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              </Buttons>
            );
          },
        },
      ],
      [form, handleAdd, handleDelete],
    );

    return (
      <GroupPane
        text="Number formatting for crosshair and info line and axis domain"
        renderHeader={(text) => {
          return (
            <FieldsBlockHeader text={text} onAdd={() => handleAdd(fields, 0)} />
          );
        }}
      >
        <ReactTable
          style={{
            'thead tr th': { zIndex: 1 },
            td: { padding: 0 },
          }}
          rowStyle={{
            hover: { backgroundColor: '#f7f7f7' },
            active: { backgroundColor: '#f5f5f5' },
          }}
          data={fields}
          columns={COLUMNS}
          emptyDataRowText="No Nucleus"
        />
      </GroupPane>
    );
  },
});

interface FieldsBlockHeaderProps {
  onAdd: () => void;
  text: string;
}

function FieldsBlockHeader(props: FieldsBlockHeaderProps) {
  const { onAdd, text } = props;
  return (
    <Section>
      <p style={{ flex: 1 }}>{text}</p>

      <Button
        size="small"
        variant="outlined"
        intent="success"
        tooltipProps={{ content: '', disabled: true }}
        onClick={onAdd}
      >
        Add nuclei preferences
      </Button>
    </Section>
  );
}

const Buttons = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

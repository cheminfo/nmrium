import { Classes } from '@blueprintjs/core';
import { useField, useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';

import type { Column } from '../../../../elements/ReactTable/ReactTable.js';
import {
  CellActions,
  CellActionsButton,
  CellInput,
  CellNumericInput,
  TableSettings,
} from '../ui/table.tsx';
import { TableSection } from '../ui/table_section.tsx';
import { defaultGeneralSettingsFormValues } from '../validation.js';

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
    const nucleiField = useField({ form, name: 'nuclei', mode: 'array' });
    const { insertValue, removeValue, pushValue } = nucleiField;

    const fields = useStore(form.store, (state) => state.values.nuclei);

    const insertNucleus = useCallback(
      (index: number) => {
        insertValue(index, emptyNucleiFormElement);
      },
      [insertValue],
    );
    const pushNucleus = useCallback(() => {
      pushValue(emptyNucleiFormElement);
    }, [pushValue]);
    const deleteNucleus = useCallback(
      (index: number) => {
        removeValue(index);
      },
      [removeValue],
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
                  <CellInput
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
                  <CellInput
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
                  <CellInput
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
                  <CellNumericInput
                    value={subField.state.value}
                    onValueChange={(num, str) => subField.handleChange(str)}
                    fill
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
                  <CellNumericInput
                    value={subField.state.value}
                    onValueChange={(num, str) => subField.handleChange(str)}
                    fill
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
            row: { index: rowIndex },
          }: CellProps<NucleiFormElement>) => {
            return (
              <CellActions>
                <CellActionsButton
                  intent="success"
                  onClick={() => insertNucleus(rowIndex + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </CellActionsButton>
                <CellActionsButton
                  intent="danger"
                  onClick={() => deleteNucleus(rowIndex)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </CellActionsButton>
              </CellActions>
            );
          },
        },
      ],
      [deleteNucleus, form, insertNucleus],
    );

    return (
      <TableSection
        title="Number formatting for crosshair and info line and axis domain"
        actions={
          <Button
            size="small"
            variant="outlined"
            intent="success"
            tooltipProps={{ content: '', disabled: true }}
            onClick={pushNucleus}
          >
            Add nuclei preferences
          </Button>
        }
      >
        <TableSettings
          data={fields}
          columns={COLUMNS}
          emptyDataRowText="No Nucleus"
        />
      </TableSection>
    );
  },
});

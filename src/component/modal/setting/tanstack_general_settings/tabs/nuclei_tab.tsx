import { Classes } from '@blueprintjs/core';
import { useField, useStore } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, createTableColumnHelper, withForm } from 'react-science/ui';

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

    const COLUMNS = useMemo(() => {
      const columnHelper = createTableColumnHelper<NucleiFormElement>();
      return [
        columnHelper.accessor('nucleus', {
          header: 'Nucleus',
          cell: ({ row: { index } }) => (
            <form.Field key={index} name={`nuclei[${index}].nucleus`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                />
              )}
            </form.Field>
          ),
        }),
        columnHelper.accessor('ppmFormat', {
          header: 'δ (ppm)',
          cell: ({ row: { index } }) => (
            <form.Field key={index} name={`nuclei[${index}].ppmFormat`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                />
              )}
            </form.Field>
          ),
        }),
        columnHelper.accessor('hzFormat', {
          header: 'Coupling (Hz)',
          cell: ({ row: { index } }) => (
            <form.Field key={index} name={`nuclei[${index}].hzFormat`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                />
              )}
            </form.Field>
          ),
        }),
        columnHelper.display({
          id: 'axisFrom',
          header: 'Axis from',
          cell: ({ row: { index } }) => (
            <form.Field key={index} name={`nuclei[${index}].axisFrom`}>
              {(subField) => (
                <CellNumericInput
                  value={subField.state.value}
                  onValueChange={(num, str) => subField.handleChange(str)}
                  fill
                />
              )}
            </form.Field>
          ),
        }),
        columnHelper.display({
          id: 'axisTo',
          header: 'Axis to',
          cell: ({ row: { index } }) => (
            <form.Field key={index} name={`nuclei[${index}].axisTo`}>
              {(subField) => (
                <CellNumericInput
                  value={subField.state.value}
                  onValueChange={(num, str) => subField.handleChange(str)}
                  fill
                />
              )}
            </form.Field>
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
          cell: ({ row: { index } }) => (
            <CellActions>
              <CellActionsButton
                intent="success"
                onClick={() => insertNucleus(index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </CellActionsButton>
              <CellActionsButton
                intent="danger"
                onClick={() => deleteNucleus(index)}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </CellActionsButton>
            </CellActions>
          ),
        }),
      ];
    }, [deleteNucleus, form, insertNucleus]);

    return (
      <TableSection
        title="Nuclei number formatting"
        description="for crosshair, info line and axis domain"
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
          emptyContent="No nucleus"
        />
      </TableSection>
    );
  },
});

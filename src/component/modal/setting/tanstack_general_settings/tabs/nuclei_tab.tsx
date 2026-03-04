import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, createTableColumnHelper, withForm } from 'react-science/ui';
import type { z } from 'zod';

import {
  CellActions,
  CellActionsButton,
  CellInput,
  CellNumericInput,
  TableSettings,
} from '../ui/table.tsx';
import { TableSection } from '../ui/table_section.tsx';
import type { nucleiValidation } from '../validation/nuclei_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.js';

type NucleiFormElement = z.input<typeof nucleiValidation>[number];

function emptyNucleiFormElement(): NucleiFormElement {
  return {
    nucleus: '',
    ppmFormat: '0.00',
    hzFormat: '0.00',
    uuid: crypto.randomUUID(),
  };
}

export const NucleiTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const nucleiField = useField({ form, name: 'nuclei', mode: 'array' });

    const { Field } = form;
    const { insertValue, removeValue, pushValue } = nucleiField;

    const insertNucleus = useCallback(
      (index: number) => {
        insertValue(index, emptyNucleiFormElement());
      },
      [insertValue],
    );
    const pushNucleus = useCallback(() => {
      pushValue(emptyNucleiFormElement());
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
            <Field key={index} name={`nuclei[${index}].nucleus`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                  onBlur={subField.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        columnHelper.accessor('ppmFormat', {
          header: 'δ (ppm)',
          cell: ({ row: { index } }) => (
            <Field key={index} name={`nuclei[${index}].ppmFormat`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                  onBlur={subField.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        columnHelper.accessor('hzFormat', {
          header: 'Coupling (Hz)',
          cell: ({ row: { index } }) => (
            <Field key={index} name={`nuclei[${index}].hzFormat`}>
              {(subField) => (
                <CellInput
                  value={subField.state.value}
                  onChange={subField.handleChange}
                  onBlur={subField.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        columnHelper.display({
          id: 'axisFrom',
          header: 'Axis from',
          cell: ({ row: { index } }) => (
            <Field key={index} name={`nuclei[${index}].axisFrom`}>
              {(subField) => (
                <CellNumericInput
                  value={subField.state.value}
                  onChange={(event) =>
                    subField.handleChange(event.currentTarget.value)
                  }
                  onBlur={subField.handleBlur}
                  fill
                />
              )}
            </Field>
          ),
        }),
        columnHelper.display({
          id: 'axisTo',
          header: 'Axis to',
          cell: ({ row: { index } }) => (
            <Field key={index} name={`nuclei[${index}].axisTo`}>
              {(subField) => (
                <CellNumericInput
                  value={subField.state.value}
                  onChange={(event) =>
                    subField.handleChange(event.currentTarget.value)
                  }
                  onBlur={subField.handleBlur}
                  fill
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
    }, [Field, deleteNucleus, insertNucleus]);
    // const fields = useStore(form.store, (state) => state.values.nuclei);

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
          data={nucleiField.state.value}
          columns={COLUMNS}
          emptyContent="No nucleus"
          getRowId={getRowId}
        />
      </TableSection>
    );
  },
});

function getRowId(row: NucleiFormElement) {
  return row.uuid;
}

import { Classes } from '@blueprintjs/core';
import { useField } from '@tanstack/react-form';
import { createColumnHelper } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, withFieldGroup, withForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { useChartData } from '../../../../context/ChartContext.tsx';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.ts';
import {
  CellActions,
  CellActionsButton,
  CellColorPicker,
  CellInput,
  TableSettings,
} from '../ui/table.tsx';
import { TableSection } from '../ui/table_section.tsx';
import type {
  spectraColorsTabOneDimensionValidation,
  spectraColorsTabTwoDimensionValidation,
} from '../validation/spectra_colors_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const SpectraColorsTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    return (
      <>
        <GeneralColors form={form} fields="spectraColors" />
        <Spectra1DColors form={form} />
        <Spectra2DColors form={form} />
      </>
    );
  },
});

const GeneralColors = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.spectraColors,
  render: ({ group }) => {
    return (
      <group.Section title="General">
        <group.AppField name="highlightColor">
          {(field) => <field.ColorPicker label="Assignment highlight color" />}
        </group.AppField>
        <group.AppField name="indicatorLineColor">
          {(field) => <field.ColorPicker label="Indicator line color" />}
        </group.AppField>
      </group.Section>
    );
  },
});

type OneDimensionData = z.input<typeof spectraColorsTabOneDimensionValidation>;
const Spectra1DColors = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const { Field } = form;

    const field = useField({
      form,
      name: 'spectraColors.oneDimension',
      mode: 'array',
    });
    const { insertValue, removeValue } = field;

    const { data: chartData } = useChartData();
    const { datalist } = useMemo(() => {
      return getSpectraObjectPaths(chartData);
    }, [chartData]);

    const handleAdd = useCallback(
      (index: number) => {
        insertValue(index, {
          value: '',
          jpath: 'info.experiment',
          color: 'red',
        });
      },
      [insertValue],
    );

    const handleDelete = useCallback(
      (index: number) => {
        removeValue(index);
      },
      [removeValue],
    );

    const COLUMNS = useMemo(() => {
      const helper = createColumnHelper<OneDimensionData>();
      return [
        helper.accessor('jpath', {
          header: 'Field',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.oneDimension[${index}].jpath`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  filterItems={datalist}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('value', {
          header: 'Value',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.oneDimension[${index}].value`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('color', {
          header: 'Color',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.oneDimension[${index}].color`}>
              {(field) => (
                <CellColorPicker
                  color={{ hex: field.state.value }}
                  onChangeComplete={({ hex }) => field.handleChange(hex)}
                />
              )}
            </Field>
          ),
        }),
        helper.display({
          id: 'actions',
          header: '',
          cell: ({ row: { index, original } }) => (
            <CellActions>
              <CellActionsButton
                intent="success"
                onClick={() => handleAdd(index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </CellActionsButton>
              {!('name' in original) && (
                <CellActionsButton
                  intent="danger"
                  onClick={() => handleDelete(index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </CellActionsButton>
              )}
            </CellActions>
          ),
        }),
      ];
    }, [Field, datalist, handleAdd, handleDelete]);

    return (
      <TableSection
        title="1D Spectra"
        actions={
          <Button
            size="small"
            variant="outlined"
            intent="success"
            onClick={() => handleAdd(0)}
          >
            Add custom color
          </Button>
        }
      >
        <TableSettings
          data={field.state.value}
          columns={COLUMNS}
          emptyContent="No criteria colors"
        />
      </TableSection>
    );
  },
});

type TwoDimensionData = z.input<typeof spectraColorsTabTwoDimensionValidation>;
const Spectra2DColors = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const { Field } = form;

    const field = useField({
      form,
      name: 'spectraColors.twoDimensions',
      mode: 'array',
    });
    const { insertValue, removeValue } = field;

    const handleAdd = useCallback(
      (index: number) => {
        insertValue(index, {
          value: '',
          jpath: 'info.experiment',
          positiveColor: 'red',
          negativeColor: 'blue',
        });
      },
      [insertValue],
    );

    const handleDelete = useCallback(
      (index: number) => {
        removeValue(index);
      },
      [removeValue],
    );

    const { data: chartData } = useChartData();
    const { datalist } = useMemo(() => {
      return getSpectraObjectPaths(chartData);
    }, [chartData]);

    const COLUMNS = useMemo(() => {
      const helper = createColumnHelper<TwoDimensionData>();
      return [
        helper.accessor('jpath', {
          header: 'Field',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.twoDimensions[${index}].jpath`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  filterItems={datalist}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('value', {
          header: 'Value',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.twoDimensions[${index}].value`}>
              {(field) => (
                <CellInput
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('positiveColor', {
          header: 'Positive color',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.twoDimensions[${index}].positiveColor`}>
              {(field) => (
                <CellColorPicker
                  color={{ hex: field.state.value }}
                  onChangeComplete={({ hex }) => {
                    field.handleChange(hex);
                    field.handleBlur();
                  }}
                />
              )}
            </Field>
          ),
        }),
        helper.accessor('negativeColor', {
          header: 'Negative color',
          cell: ({ row: { index } }) => (
            <Field name={`spectraColors.twoDimensions[${index}].negativeColor`}>
              {(field) => (
                <CellColorPicker
                  color={{ hex: field.state.value }}
                  onChangeComplete={({ hex }) => {
                    field.handleChange(hex);
                    field.handleBlur();
                  }}
                />
              )}
            </Field>
          ),
        }),
        helper.display({
          id: 'actions',
          header: '',
          cell: ({ row: { index, original } }) => (
            <CellActions>
              <CellActionsButton
                intent="success"
                onClick={() => handleAdd(index + 1)}
              >
                <FaPlus className={Classes.ICON} />
              </CellActionsButton>
              {!('name' in original) && (
                <CellActionsButton
                  intent="danger"
                  onClick={() => handleDelete(index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </CellActionsButton>
              )}
            </CellActions>
          ),
        }),
      ];
    }, [Field, datalist, handleAdd, handleDelete]);

    return (
      <TableSection
        title="2D Spectra"
        actions={
          <Button
            size="small"
            variant="outlined"
            intent="success"
            onClick={() => handleAdd(0)}
          >
            Add custom color
          </Button>
        }
      >
        <TableSettings
          data={field.state.value}
          columns={COLUMNS}
          emptyContent="No criteria colors"
        />
      </TableSection>
    );
  },
});

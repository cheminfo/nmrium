import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useField } from '@tanstack/react-form';
import { useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button, ColorPickerDropdown, withForm } from 'react-science/ui';
import type { CellProps } from 'react-table';
import type { z } from 'zod/v4';

import { useChartData } from '../../../../context/ChartContext.tsx';
import type { Column } from '../../../../elements/ReactTable/ReactTable.tsx';
import { getSpectraObjectPaths } from '../../../../utility/getSpectraObjectPaths.ts';
import { CellActions, CellInput, TableSettings } from '../ui/table.tsx';
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
        <form.Section title="General">
          <form.AppField name="spectraColors.highlightColor">
            {(field) => (
              <field.ColorPicker label="Assignment highlight color" />
            )}
          </form.AppField>
          <form.AppField name="spectraColors.indicatorLineColor">
            {(field) => <field.ColorPicker label="Indicator line color" />}
          </form.AppField>
        </form.Section>
        <TableSection title="One dimension">
          <OneDimension form={form} />
        </TableSection>
        <TableSection title="Two dimension">
          <TwoDimension form={form} />
        </TableSection>
      </>
    );
  },
});

type OneDimensionData = z.input<typeof spectraColorsTabOneDimensionValidation>;
const OneDimension = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const field = useField({
      form,
      name: 'spectraColors.oneDimension',
      mode: 'array',
    });

    const { data: chartData } = useChartData();
    const { datalist } = useMemo(() => {
      return getSpectraObjectPaths(chartData);
    }, [chartData]);

    const handleAdd = useCallback(
      (index: number) => {
        field.insertValue(index, {
          value: '',
          jpath: 'info.experiment',
          color: 'red',
        });
      },
      [field],
    );

    const handleDelete = useCallback(
      (index: number) => {
        field.removeValue(index);
      },
      [field],
    );

    const COLUMNS = useMemo<Array<Column<OneDimensionData>>>(() => {
      return [
        {
          Header: 'Field',
          Cell: ({ row: { index } }: CellProps<OneDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.oneDimension[${index}].jpath`}
              >
                {(field) => (
                  <CellInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    filterItems={datalist}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: 'Value',
          Cell: ({ row: { index } }: CellProps<OneDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.oneDimension[${index}].value`}
              >
                {(field) => (
                  <CellInput
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: 'Color',
          Cell: ({ row: { index } }: CellProps<OneDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.oneDimension[${index}].color`}
              >
                {(field) => (
                  <ColorPickerDropdown
                    color={{ hex: field.state.value }}
                    onChangeComplete={({ hex }) => field.handleChange(hex)}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: '',
          style: { width: 60 },
          id: 'operation-button',
          Cell: ({ row: { index, original } }: CellProps<OneDimensionData>) => {
            return (
              <CellActions>
                <Button
                  size="small"
                  variant="outlined"
                  intent="success"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleAdd(index + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                {!('name' in original) && (
                  <Button
                    size="small"
                    variant="outlined"
                    intent="danger"
                    tooltipProps={{ content: '', disabled: true }}
                    onClick={() => handleDelete(index)}
                  >
                    <FaRegTrashAlt className={Classes.ICON} />
                  </Button>
                )}
              </CellActions>
            );
          },
        },
      ];
    }, [datalist, form, handleAdd, handleDelete]);

    return (
      <Header>
        <HeaderButtons>
          <Button
            size="small"
            variant="outlined"
            intent="success"
            tooltipProps={{ content: '', disabled: true }}
            onClick={() => handleAdd(0)}
          >
            Add custom color
          </Button>
        </HeaderButtons>
        <TableSettings
          data={field.state.value}
          columns={COLUMNS}
          emptyDataRowText="No Fields"
        />
      </Header>
    );
  },
});

type TwoDimensionData = z.input<typeof spectraColorsTabTwoDimensionValidation>;
const TwoDimension = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const field = useField({
      form,
      name: 'spectraColors.twoDimensions',
      mode: 'array',
    });

    const handleAdd = useCallback(
      (index: number) => {
        field.insertValue(index, {
          value: '',
          jpath: 'info.experiment',
          positiveColor: 'red',
          negativeColor: 'blue',
        });
      },
      [field],
    );

    const handleDelete = useCallback(
      (index: number) => {
        field.removeValue(index);
      },
      [field],
    );

    const { data: chartData } = useChartData();
    const { datalist } = useMemo(() => {
      return getSpectraObjectPaths(chartData);
    }, [chartData]);

    const COLUMNS = useMemo<Array<Column<TwoDimensionData>>>(() => {
      return [
        {
          Header: 'Field',
          Cell: ({ row: { index } }: CellProps<TwoDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.twoDimensions[${index}].jpath`}
              >
                {(field) => {
                  console.log('test', field.state.value);

                  return (
                    <CellInput
                      name={field.name}
                      value={
                        Array.isArray(field.state.value)
                          ? field.state.value.join('.')
                          : field.state.value
                      }
                      onBlur={field.handleBlur}
                      filterItems={datalist}
                      onChange={field.handleChange}
                    />
                  );
                }}
              </form.AppField>
            );
          },
        },
        {
          Header: 'Value',
          Cell: ({ row: { index } }: CellProps<TwoDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.twoDimensions[${index}].value`}
              >
                {(field) => (
                  <CellInput
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: 'Positive color',
          Cell: ({ row: { index } }: CellProps<TwoDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.twoDimensions[${index}].positiveColor`}
              >
                {(field) => (
                  <ColorPickerDropdown
                    color={{ hex: field.state.value }}
                    onChangeComplete={({ hex }) => field.handleChange(hex)}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: 'Negative color',
          Cell: ({ row: { index } }: CellProps<TwoDimensionData>) => {
            return (
              <form.AppField
                name={`spectraColors.twoDimensions[${index}].negativeColor`}
              >
                {(field) => (
                  <ColorPickerDropdown
                    color={{ hex: field.state.value }}
                    onChangeComplete={({ hex }) => field.handleChange(hex)}
                  />
                )}
              </form.AppField>
            );
          },
        },
        {
          Header: '',
          style: { width: 60 },
          id: 'operation-button',
          Cell: ({ row: { index, original } }: CellProps<TwoDimensionData>) => {
            return (
              <CellActions>
                <Button
                  size="small"
                  variant="outlined"
                  intent="success"
                  tooltipProps={{ content: '', disabled: true }}
                  onClick={() => handleAdd(index + 1)}
                >
                  <FaPlus className={Classes.ICON} />
                </Button>
                {!('name' in original) && (
                  <Button
                    size="small"
                    variant="outlined"
                    intent="danger"
                    tooltipProps={{ content: '', disabled: true }}
                    onClick={() => handleDelete(index)}
                  >
                    <FaRegTrashAlt className={Classes.ICON} />
                  </Button>
                )}
              </CellActions>
            );
          },
        },
      ];
    }, [datalist, form, handleAdd, handleDelete]);

    return (
      <Header>
        <HeaderButtons>
          <Button
            size="small"
            variant="outlined"
            intent="success"
            tooltipProps={{ content: '', disabled: true }}
            onClick={() => handleAdd(0)}
          >
            Add custom color
          </Button>
        </HeaderButtons>
        <TableSettings
          data={field.state.value}
          columns={COLUMNS}
          emptyDataRowText="No Fields"
        />
      </Header>
    );
  },
});

const Header = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: column;
`;

const HeaderButtons = styled.div`
  display: flex;
  justify-content: end;
`;

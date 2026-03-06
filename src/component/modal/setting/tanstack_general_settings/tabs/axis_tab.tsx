import { axisUnits } from '@zakodium/nmrium-core';
import {
  FieldGroupSVGLineStyleFields,
  FieldGroupSVGTextStyleFields,
  withFieldGroup,
  withForm,
} from 'react-science/ui';
import type { z } from 'zod';

import type { gridlineValidation } from '../validation/axis_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

const axisUnitItems = axisUnits.map((unit) => ({ label: unit, value: unit }));

export const AxisTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <TicksSection form={form} fields="axis" />
        <Spectra1DSection form={form} fields="axis" />
        <Spectra2DSection form={form} fields="axis" />
      </>
    );
  },
});

const TicksSection = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.axis,
  render: ({ group }) => {
    const { AppField, Section } = group;

    return (
      <Section title="Ticks">
        <FieldGroupSVGTextStyleFields
          form={group}
          fields="primaryTicks.textStyle"
          label="Primary tick style"
          previewText="0"
        />
        <hr />
        <AppField name="secondaryTicks.enabled">
          {({ Checkbox }) => <Checkbox label="Show secondary ticks" />}
        </AppField>
      </Section>
    );
  },
});

const Spectra1DSection = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.axis,
  render: ({ group }) => {
    const { Section } = group;

    return (
      <Section title="Spectra 1D">
        <GridlineSection
          form={group}
          fields="gridlines1D.primary"
          label="Primary grid lines"
        />

        <GridlineSection
          form={group}
          fields="gridlines1D.secondary"
          label="Secondary grid lines"
        />
      </Section>
    );
  },
});

const defaultValuesGridline: z.input<typeof gridlineValidation> = {
  enabled: true,
  lineStyle: {},
};
const GridlineSection = withFieldGroup({
  defaultValues: defaultValuesGridline,
  props: { label: '' },
  render: ({ group, label }) => {
    const { AppField, Section } = group;

    return (
      <Section title={label}>
        <AppField name="enabled">
          {({ Checkbox }) => <Checkbox label="Show" />}
        </AppField>
        <FieldGroupSVGLineStyleFields
          form={group}
          fields="lineStyle"
          label="Line style"
        />
      </Section>
    );
  },
});

const Spectra2DSection = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.axis,
  render: ({ group }) => {
    const { Section } = group;

    return (
      <Section title="Spectra 2D">
        <GridlineSection
          form={group}
          fields="gridlines2D.primary"
          label="Primary grid lines"
        />

        <GridlineSection
          form={group}
          fields="gridlines2D.secondary"
          label="Secondary grid lines"
        />
      </Section>
    );
  },
});

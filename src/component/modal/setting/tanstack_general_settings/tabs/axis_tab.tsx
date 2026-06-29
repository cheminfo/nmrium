import {
  FieldGroupSVGLineStyleFields,
  FieldGroupSVGTextStyleFields,
  withFieldGroup,
  withForm,
} from 'react-science/ui';
import type { z } from 'zod';

import type { gridlineValidation } from '../validation/axis_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

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
          label="Style"
          previewText="0"
        />
        <group.AppField name="primaryTicks.tickStyle.stroke">
          {(field) => <field.ColorPicker label="Primary color" disableAlpha />}
        </group.AppField>
        <group.AppField name="primaryTicks.tickStyle.strokeOpacity">
          {(field) => (
            <field.NumericInput
              label="Primary opacity"
              min={0}
              max={1}
              minorStepSize={0.01}
              step={0.05}
              majorStepSize={0.1}
            />
          )}
        </group.AppField>
        <group.AppField name="primaryTicks.tickStyle.strokeWidth">
          {(field) => <field.NumericInput label="Primary width" />}
        </group.AppField>

        <group.AppField name="secondaryTicks.tickStyle.stroke">
          {(field) => (
            <field.ColorPicker label="Secondary color" disableAlpha />
          )}
        </group.AppField>
        <group.AppField name="secondaryTicks.tickStyle.strokeOpacity">
          {(field) => (
            <field.NumericInput
              label="Secondary opacity"
              min={0}
              max={1}
              minorStepSize={0.01}
              step={0.05}
              majorStepSize={0.1}
            />
          )}
        </group.AppField>
        <group.AppField name="secondaryTicks.tickStyle.strokeWidth">
          {(field) => <field.NumericInput label="Secondary width" />}
        </group.AppField>
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

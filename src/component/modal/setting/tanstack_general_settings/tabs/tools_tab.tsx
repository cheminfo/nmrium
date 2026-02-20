import { withFieldGroup, withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const ToolsTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <ChartTools form={form} fields="display.toolBarButtons" />
        <ImportExportTools form={form} fields="display.toolBarButtons" />
        <SpectraManipulationTools form={form} fields="display.toolBarButtons" />
        <Spectra1DManipulationTools
          form={form}
          fields="display.toolBarButtons"
        />
        <Spectra2DManipulationTools
          form={form}
          fields="display.toolBarButtons"
        />
      </>
    );
  },
});

const ChartTools = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.toolBarButtons,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="Chart">
        <AppField name="zoom">
          {({ Checkbox }) => <Checkbox label="Zoom in" />}
        </AppField>
        <AppField name="zoomOut">
          {({ Checkbox }) => <Checkbox label="Zoom out" />}
        </AppField>
        <AppField name="inset">
          {({ Checkbox }) => <Checkbox label="Inset" />}
        </AppField>
        <AppField name="spectraStackAlignments">
          {({ Checkbox }) => <Checkbox label="Stack alignments" />}
        </AppField>
        <AppField name="spectraCenterAlignments">
          {({ Checkbox }) => <Checkbox label="Center alignments" />}
        </AppField>
        <AppField name="realImaginary">
          {({ Checkbox }) => <Checkbox label="Real / Imaginary" />}
        </AppField>
      </Section>
    );
  },
});

const ImportExportTools = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.toolBarButtons,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="Import / Export">
        <AppField name="import">
          {({ Checkbox }) => <Checkbox label="Import" />}
        </AppField>
        <AppField name="exportAs">
          {({ Checkbox }) => <Checkbox label="Export as" />}
        </AppField>
      </Section>
    );
  },
});

const SpectraManipulationTools = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.toolBarButtons,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="Spectra manipulation">
        <AppField name="peakPicking">
          {({ Checkbox }) => <Checkbox label="Peak picking" />}
        </AppField>
        <AppField name="integral">
          {({ Checkbox }) => <Checkbox label="Integrals" />}
        </AppField>
        <AppField name="zonePicking">
          {({ Checkbox }) => <Checkbox label="Zone picking" />}
        </AppField>
        <AppField name="rangePicking">
          {({ Checkbox }) => <Checkbox label="Range picking" />}
        </AppField>
        <AppField name="zeroFilling">
          {({ Checkbox }) => <Checkbox label="Zero filling" />}
        </AppField>
        <AppField name="slicing">
          {({ Checkbox }) => <Checkbox label="Slicing" />}
        </AppField>
        <AppField name="apodization">
          {({ Checkbox }) => <Checkbox label="Apodization" />}
        </AppField>
        <AppField name="phaseCorrection">
          {({ Checkbox }) => <Checkbox label="Phase correction" />}
        </AppField>
        <AppField name="baselineCorrection">
          {({ Checkbox }) => <Checkbox label="Baseline correction" />}
        </AppField>
        <AppField name="fft">
          {({ Checkbox }) => <Checkbox label="Fourier transform" />}
        </AppField>
        <AppField name="exclusionZones">
          {({ Checkbox }) => <Checkbox label="Exclusion zones" />}
        </AppField>
        <AppField name="autoRangeAndZonePicking">
          {({ Checkbox }) => <Checkbox label="Auto range and zone picking" />}
        </AppField>
        <AppField name="multipleSpectraAnalysis">
          {({ Checkbox }) => <Checkbox label="Multiple spectra integration" />}
        </AppField>
      </Section>
    );
  },
});

const Spectra1DManipulationTools = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.toolBarButtons,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="1D Spectra manipulation">
        <AppField name="zeroFillingDimension1">
          {({ Checkbox }) => <Checkbox label="Zero filling" />}
        </AppField>
        <AppField name="apodizationDimension1">
          {({ Checkbox }) => <Checkbox label="Apodization" />}
        </AppField>
        <AppField name="fftDimension1">
          {({ Checkbox }) => <Checkbox label="Fourier transform" />}
        </AppField>
      </Section>
    );
  },
});

const Spectra2DManipulationTools = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.toolBarButtons,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="2D Spectra manipulation">
        <AppField name="zeroFillingDimension2">
          {({ Checkbox }) => <Checkbox label="Zero filling" />}
        </AppField>
        <AppField name="apodizationDimension2">
          {({ Checkbox }) => <Checkbox label="Apodization" />}
        </AppField>
        <AppField name="phaseCorrectionTwoDimensions">
          {({ Checkbox }) => <Checkbox label="Phase correction" />}
        </AppField>
        <AppField name="fftDimension2">
          {({ Checkbox }) => <Checkbox label="Fourier transform" />}
        </AppField>
      </Section>
    );
  },
});

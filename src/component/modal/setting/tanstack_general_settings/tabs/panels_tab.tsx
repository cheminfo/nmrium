import { withFieldGroup, withForm } from 'react-science/ui';

import { displayPanelsStatus } from '../validation/panels_tab_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

export const PanelsTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    const { Section, AppField } = form;
    return (
      <>
        <Section title="Panels bar">
          <AppField name="display.general.hidePanelsBar">
            {({ Checkbox }) => <Checkbox label="Hide panels bar" />}
          </AppField>
        </Section>

        <SpectraSettings form={form} fields="display.panels" />
        <Spectra1dSettings form={form} fields="display.panels" />
        <Spectra2dSettings form={form} fields="display.panels" />
        <ChemicalSettings form={form} fields="display.panels" />
      </>
    );
  },
});

const SpectraSettings = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.panels,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="Spectra">
        <AppField name="spectraPanel">
          {({ Select }) => (
            <Select label="Spectra selection" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="informationPanel">
          {({ Select }) => (
            <Select label="Information" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="processingsPanel">
          {({ Select }) => (
            <Select label="Processing" items={displayPanelsStatus} />
          )}
        </AppField>
      </Section>
    );
  },
});

const Spectra1dSettings = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.panels,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="1D Spectra">
        <AppField name="peaksPanel">
          {({ Select }) => <Select label="Peaks" items={displayPanelsStatus} />}
        </AppField>
        <AppField name="integralsPanel">
          {({ Select }) => (
            <Select label="Integrals" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="rangesPanel">
          {({ Select }) => (
            <Select
              label="Ranges / Multiplet analysis"
              items={displayPanelsStatus}
            />
          )}
        </AppField>
        <AppField name="matrixGenerationPanel">
          {({ Select }) => (
            <Select label="Matrix generation" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="simulationPanel">
          {({ Select }) => (
            <Select label="Spectrum simulation" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="multipleSpectraAnalysisPanel">
          {({ Select }) => (
            <Select
              label="Multiple spectra analysis"
              items={displayPanelsStatus}
            />
          )}
        </AppField>
      </Section>
    );
  },
});

const Spectra2dSettings = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.panels,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="2D Spectra">
        <AppField name="zonesPanel">
          {({ Select }) => <Select label="Zones" items={displayPanelsStatus} />}
        </AppField>
      </Section>
    );
  },
});

const ChemicalSettings = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.display.panels,
  render: ({ group }) => {
    const { Section, AppField } = group;

    return (
      <Section title="Chemicals">
        <AppField name="structuresPanel">
          {({ Select }) => (
            <Select label="Chemical structures" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="summaryPanel">
          {({ Select }) => (
            <Select label="Summary" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="databasePanel">
          {({ Select }) => (
            <Select label="Databases" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="predictionPanel">
          {({ Select }) => (
            <Select label="Prediction" items={displayPanelsStatus} />
          )}
        </AppField>
        <AppField name="automaticAssignmentPanel">
          {({ Select }) => (
            <Select label="Automatic assignment" items={displayPanelsStatus} />
          )}
        </AppField>
      </Section>
    );
  },
});

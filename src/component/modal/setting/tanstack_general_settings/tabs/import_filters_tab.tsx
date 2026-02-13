import { withFieldGroup, withForm } from 'react-science/ui';

import {
  defaultGeneralSettingsFormValues,
  nmrLoadersGeneralDataSelection,
} from '../validation.ts';

export const ImportFiltersTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    const { Section } = form;

    return (
      <>
        <Section title="General">
          <General form={form} fields="nmrLoaders.general" />
        </Section>
        <Section title="Bruker">
          <Bruker form={form} fields="nmrLoaders.bruker" />
        </Section>
      </>
    );
  },
});

const General = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.nmrLoaders.general,
  render: ({ group }) => {
    const { AppField } = group;

    return (
      <>
        <AppField name="keep1D">
          {({ Checkbox }) => <Checkbox label="Keep 1D" />}
        </AppField>
        <AppField name="keep2D">
          {({ Checkbox }) => <Checkbox label="Keep 2D" />}
        </AppField>
        <AppField name="onlyReal">
          {({ Checkbox }) => <Checkbox label="Only real" />}
        </AppField>
        <AppField name="dataSelection">
          {({ Select }) => (
            <Select
              label="Data selection"
              items={nmrLoadersGeneralDataSelection}
            />
          )}
        </AppField>
      </>
    );
  },
});

const Bruker = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.nmrLoaders.bruker,
  render: ({ group }) => {
    const { AppField } = group;

    return (
      <>
        <AppField name="processingNumbers">
          {({ Input }) => <Input label="Processing numbers" />}
        </AppField>
        <AppField name="experimentNumbers">
          {({ Input }) => <Input label="Experiment numbers" />}
        </AppField>
        <AppField name="onlyFirstProcessedData">
          {({ Checkbox }) => <Checkbox label="Only first processed data" />}
        </AppField>
      </>
    );
  },
});

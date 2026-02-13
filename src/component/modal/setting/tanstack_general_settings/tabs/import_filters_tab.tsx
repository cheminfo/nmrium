import { withFieldGroup, withForm } from 'react-science/ui';

import {
  defaultGeneralSettingsFormValues,
  nmrLoadersGeneralDataSelection,
} from '../validation.ts';

export const ImportFiltersTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <form.Section title="General">
          <General form={form} fields="nmrLoaders.general" />
        </form.Section>
        <form.Section title="Bruker">
          <Bruker form={form} fields="nmrLoaders.bruker" />
        </form.Section>
      </>
    );
  },
});

const General = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.nmrLoaders.general,
  render: ({ group }) => {
    return (
      <>
        <group.AppField name="keep1D">
          {({ Checkbox }) => <Checkbox label="Keep 1D" />}
        </group.AppField>
        <group.AppField name="keep2D">
          {({ Checkbox }) => <Checkbox label="Keep 2D" />}
        </group.AppField>
        <group.AppField name="onlyReal">
          {({ Checkbox }) => <Checkbox label="Only real" />}
        </group.AppField>
        <group.AppField name="dataSelection">
          {({ Select }) => (
            <Select
              label="Data selection"
              items={nmrLoadersGeneralDataSelection}
            />
          )}
        </group.AppField>
      </>
    );
  },
});

const Bruker = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.nmrLoaders.bruker,
  render: ({ group }) => {
    return (
      <>
        <group.AppField name="processingNumbers">
          {({ Input }) => <Input label="Processing numbers" />}
        </group.AppField>
        <group.AppField name="experimentNumbers">
          {({ Input }) => <Input label="Experiment numbers" />}
        </group.AppField>
        <group.AppField name="onlyFirstProcessedData">
          {({ Checkbox }) => <Checkbox label="Only first processed data" />}
        </group.AppField>
      </>
    );
  },
});

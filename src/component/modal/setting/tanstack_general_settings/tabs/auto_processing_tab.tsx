import { useStore } from '@tanstack/react-form';
import { withFieldGroup, withForm } from 'react-science/ui';
import type { z } from 'zod';

import { getFilterLabel } from '../../../../../data/getFilterLabel.ts';
import type { filtersValidation } from '../validation/auto_processing_tab_validation.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const AutoProcessingTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const isExperimentalFeatures = useStore(
      form.store,
      (state) => state.values.display.general?.experimentalFeatures?.display,
    );

    return (
      <div>
        <form.Section title="General">
          <form.AppField name="onLoadProcessing.autoProcessing">
            {(field) => (
              <field.Checkbox label="Enable auto processing on load" />
            )}
          </form.AppField>
        </form.Section>
        {isExperimentalFeatures && (
          <AutoProcessingFilters
            form={form}
            fields="onLoadProcessing.filters"
          />
        )}
      </div>
    );
  },
});

const AutoProcessingFilters = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.onLoadProcessing.filters,
  render: function Render({ group }) {
    const { Section } = group;

    const nuclei = Object.keys(group.state.values);

    return (
      <>
        {nuclei.map((nucleus) => (
          <Section key={nucleus} title={`${nucleus} Filters`}>
            <NucleusFilters form={group} fields={nucleus} />
          </Section>
        ))}
      </>
    );
  },
});

const defaultValuesNucleus: z.input<typeof filtersValidation> = [
  { name: 'apodization', enabled: true },
];
const NucleusFilters = withFieldGroup({
  defaultValues: defaultValuesNucleus,
  render: function Render({ group }) {
    const { AppField } = group;

    const filters = group.state.values;
    if (!filters) return null;

    return filters.map(({ name }, index) => {
      return (
        <AppField key={name} name={`[${index}].enabled`}>
          {(field) => <field.Checkbox label={getFilterLabel(name)} />}
        </AppField>
      );
    });
  },
});

import { useStore } from '@tanstack/react-form';
import { withForm } from 'react-science/ui';

import { getFilterLabel } from '../../../../../data/getFilterLabel.ts';
import type { FilterEntry } from '../../../../../data/types/common/FilterEntry.ts';
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
        {isExperimentalFeatures && <AutoProcessingTabs form={form} />}
      </div>
    );
  },
});

const AutoProcessingTabs = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function Render({ form }) {
    const filters = useStore(
      form.store,
      (state) => state.values.onLoadProcessing.filters,
    );

    return (
      <>
        {Object.keys(filters || {}).map((nucleus) => (
          <form.Section key={nucleus} title={`${nucleus} Filters`}>
            <NucleusElement form={form} nucleus={nucleus} />
          </form.Section>
        ))}
      </>
    );
  },
});

const NucleusElement = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  props: {
    nucleus: '',
  },
  render: function Render({ form, nucleus }) {
    const elements = useStore(
      form.store,
      (state) => state.values.onLoadProcessing.filters?.[nucleus],
    );

    return (
      <div>
        {Object.keys(elements ?? {}).map((key) => {
          return (
            <form.AppField
              key={key}
              name={`onLoadProcessing.filters.${nucleus}.${key as FilterEntry['name']}`}
            >
              {(field) => (
                <field.Checkbox
                  label={getFilterLabel(key as FilterEntry['name'])}
                />
              )}
            </form.AppField>
          );
        })}
      </div>
    );
  },
});

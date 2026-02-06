import { withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const GeneralTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <form.Section title="General">
          <form.AppField name="general.dimmedSpectraOpacity">
            {(field) => (
              <field.NumericInput
                label="Opacity of dimmed spectra"
                helpText="Should be between [0 - 1]"
                min={0}
                max={1}
                step={0.1}
              />
            )}
          </form.AppField>
          <form.AppField name="general.invertActions">
            {(field) => <field.Switch label="Invert actions" />}
          </form.AppField>
          <form.AppField name="general.invertScroll">
            {(field) => <field.Switch label="Invert scroll" />}
          </form.AppField>
        </form.Section>

        <form.Section title="Experimental features">
          <form.AppField name="general.experimentalFeatures">
            {(field) => <field.Switch label="Enable experimental features" />}
          </form.AppField>
        </form.Section>
      </>
    );
  },
});

import { withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const GeneralTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
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
    );
  },
});

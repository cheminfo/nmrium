import { withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from '../validation.js';

import { ExportFields } from './export_tab.fields.tsx';

export const ExportTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <form.Section title="Export SVG to file options">
          <ExportFields form={form} fields="export.svg" />
        </form.Section>
        <form.Section title="Export PNG to file options">
          <ExportFields form={form} fields="export.png" />
        </form.Section>
        <form.Section title="Export PNG to clipboard options">
          <ExportFields form={form} fields="export.clipboard" />
        </form.Section>
      </>
    );
  },
});

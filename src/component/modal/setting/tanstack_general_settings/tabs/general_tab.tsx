import { Tag } from '@blueprintjs/core';
import { withForm } from 'react-science/ui';

import { LOGGER_LEVELS } from '../../../../context/LoggerContext.tsx';
import type { SelectDefaultItem } from '../../../../elements/Select2.tsx';
import { defaultGeneralSettingsFormValues } from '../validation.js';

const SHAPE_RENDERING: SelectDefaultItem[] = [
  {
    label: 'Auto',
    value: 'auto',
  },
  {
    label: 'Optimize speed',
    value: 'optimizeSpeed',
  },
  {
    label: 'Crisp edges',
    value: 'crispEdges',
  },
  {
    label: 'Geometric precision',
    value: 'geometricPrecision',
  },
];

const LOGS_LEVELS = Object.keys(LOGGER_LEVELS).map((level) => ({
  label: level.replace(/^\w/, (c) => c.toUpperCase()),
  value: level,
}));

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
          <form.AppField name="general.invert">
            {(field) => <field.Switch label="Invert actions" />}
          </form.AppField>
          <form.AppField name="general.invertScroll">
            {(field) => <field.Switch label="Invert scroll" />}
          </form.AppField>
        </form.Section>
        <form.Section title="Experimental features">
          <form.AppField name="display.general.experimentalFeatures.display">
            {(field) => <field.Switch label="Enable experimental features" />}
          </form.AppField>
        </form.Section>
        <form.Section title="Rendering">
          <form.AppField name="general.spectraRendering">
            {(field) => (
              <field.Select label="Spectra rendering" items={SHAPE_RENDERING} />
            )}
          </form.AppField>
        </form.Section>
        <form.Section title="Logging settings">
          <form.AppField name="general.loggingLevel">
            {(field) => <field.Select label="Level" items={LOGS_LEVELS} />}
          </form.AppField>
          <form.AppField name="general.popupLoggingLevel">
            {(field) => (
              <field.Select label="Popup logging level" items={LOGS_LEVELS} />
            )}
          </form.AppField>
        </form.Section>
        <form.Section title="Peaks label">
          <form.AppField name="peaksLabel.marginTop">
            {(field) => (
              <field.NumericInput
                label="Margin top"
                min={0}
                max={1}
                stepSize={0.1}
                rightElement={<Tag>px</Tag>}
              />
            )}
          </form.AppField>
        </form.Section>
      </>
    );
  },
});

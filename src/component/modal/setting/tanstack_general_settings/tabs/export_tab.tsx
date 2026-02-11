import { Radio, RadioGroup, SegmentedControl, Tag } from '@blueprintjs/core';
import {
  FormGroup,
  assert,
  assertUnreachable,
  withFieldGroup,
  withForm,
} from 'react-science/ui';

import { convertToPixels } from '../../../../elements/export/units.ts';
import { getExportOptions } from '../../../../elements/export/utilities/getExportOptions.ts';
import { pageSizes } from '../../../../elements/print/pageSize.ts';
import { workspaceDefaultProperties } from '../../../../workspaces/workspaceDefaultProperties.ts';
import { defaultGeneralSettingsFormValues } from '../validation.ts';

export const ExportTab = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <>
        <div style={{ marginTop: '-15px' }}>
          <form.Section title="Export SVG to file options">
            <ExportFields form={form} fields="export.svg" />
          </form.Section>
        </div>
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

type Mode = 'basic' | 'advance';
type Layout = 'portrait' | 'landscape';
const ExportFields = withFieldGroup({
  defaultValues: workspaceDefaultProperties.export.png,
  render: ({ group }) => {
    return (
      <>
        <group.Field name="mode">
          {(field) => (
            <FormGroup label="Mode">
              <SegmentedControl
                defaultValue={field.state.value}
                onValueChange={(v) => field.handleChange(v as Mode)}
                options={[
                  { label: 'Basic', value: 'basic' },
                  { label: 'Advanced', value: 'advance' },
                ]}
                inline
              />
            </FormGroup>
          )}
        </group.Field>
        <group.Subscribe selector={(s) => s.values}>
          {(values) => {
            const { width, height, dpi, unit } = getExportOptions(values);
            const widthInPixel = convertToPixels(width, unit, dpi, {
              precision: 0,
            });
            const heightInPixel = convertToPixels(height, unit, dpi, {
              precision: 0,
            });

            return (
              <FormGroup label="Description">
                <Tag>{`${widthInPixel} px x ${heightInPixel} px @ ${dpi}DPI`}</Tag>
              </FormGroup>
            );
          }}
        </group.Subscribe>
        <group.Subscribe selector={(state) => state.values.mode}>
          {(mode) => {
            switch (mode) {
              case 'basic':
                return (
                  <>
                    <group.Subscribe
                      selector={(state) => {
                        assert(state.values.mode === 'basic');
                        return state.values.layout;
                      }}
                    >
                      {(layout) => (
                        <group.AppField name="size">
                          {(field) => (
                            <field.Select
                              label="Size"
                              items={pageSizes.map((item) => ({
                                value: item.name,
                                label: `${item.name} (${item[layout].width} cm x ${item[layout].height} cm)`,
                              }))}
                            />
                          )}
                        </group.AppField>
                      )}
                    </group.Subscribe>
                    <group.Field name="layout">
                      {(field) => (
                        <FormGroup name={field.name} label="Layout">
                          <RadioGroup
                            inline
                            name={field.name}
                            selectedValue={field.state.value}
                            onChange={(event) =>
                              field.handleChange(
                                event.currentTarget.value as Layout,
                              )
                            }
                          >
                            <Radio label="Portrait" value="portrait" />
                            <Radio label="Landscape" value="landscape" />
                          </RadioGroup>
                        </FormGroup>
                      )}
                    </group.Field>
                  </>
                );
              case 'advance':
                return null;
              default:
                assertUnreachable(mode);
            }
          }}
        </group.Subscribe>
        <group.AppField name="dpi">
          {(field) => <field.NumericInput label="DPI" />}
        </group.AppField>
        <group.AppField name="useDefaultSettings">
          {(field) => (
            <field.Checkbox label="Don't show the options dialog during export and use current settings" />
          )}
        </group.AppField>
      </>
    );
  },
});

import {
  Checkbox,
  Radio,
  RadioGroup,
  SegmentedControl,
  Tag,
} from '@blueprintjs/core';
import { useStore } from '@tanstack/react-form';
import type { PageSizeName, Unit } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { useMemo } from 'react';
import {
  FormGroup,
  assert,
  assertUnreachable,
  withFieldGroup,
} from 'react-science/ui';

import { convertToPixels } from '../../../../elements/export/units.ts';
import { useExportConfigurer } from '../../../../elements/export/useExportConfigurer.tsx';
import {
  getExportDefaultOptionsByMode,
  getExportOptions,
} from '../../../../elements/export/utilities/getExportOptions.ts';
import { pageSizes } from '../../../../elements/print/pageSize.ts';
import {
  defaultGeneralSettingsFormValues,
  exportSettingsValidation,
} from '../validation.ts';

type Mode = 'basic' | 'advance';
type Layout = 'portrait' | 'landscape';

interface SelectItem<Value extends string> {
  label: string;
  value: Value;
}

const pageSizeItems: Record<Layout, Array<SelectItem<PageSizeName>>> = {
  portrait: pageSizes.map((item) => ({
    value: item.name,
    label: `${item.name} (${item.portrait.width} cm x ${item.portrait.height} cm)`,
  })),
  landscape: pageSizes.map((item) => ({
    value: item.name,
    label: `${item.name} (${item.landscape.width} cm x ${item.landscape.height} cm)`,
  })),
};
const modeItems: Array<SelectItem<Mode>> = [
  { label: 'Basic', value: 'basic' },
  { label: 'Advanced', value: 'advance' },
];
const unitItems: Array<SelectItem<Unit>> = units.map((u) => ({
  label: u.name,
  value: u.unit,
}));

export const ExportFields = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.export.png,
  /* eslint-disable react-hooks/rules-of-hooks */
  render: ({ group }) => {
    const inputValues = useStore(group.store, (s) => s.values);
    const outputValues = useMemo(() => {
      return exportSettingsValidation.decode(inputValues);
    }, [inputValues]);
    const advancedTransforms = useExportConfigurer(outputValues);

    return (
      <>
        <group.Field name="mode">
          {(field) => (
            <FormGroup label="Mode">
              <SegmentedControl
                defaultValue={field.state.value}
                onValueChange={(v) => {
                  const newMode = v as Mode;
                  const newOptions = getExportDefaultOptionsByMode(newMode);

                  for (const [key, value] of Object.entries(newOptions)) {
                    group.setFieldValue(key as keyof typeof newOptions, value, {
                      dontRunListeners: true,
                    });
                  }
                }}
                options={modeItems}
                inline
              />
            </FormGroup>
          )}
        </group.Field>
        <group.Subscribe selector={(s) => s.values}>
          {(values) => {
            const { width, height, dpi, unit } = getExportOptions(
              exportSettingsValidation.decode(values),
            );
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
                        return pageSizeItems[state.values.layout];
                      }}
                    >
                      {(items) => (
                        <group.AppField name="size">
                          {(field) => (
                            <field.Select label="Size" items={items} />
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
                return (
                  <>
                    <group.AppField
                      name="unit"
                      listeners={{
                        onChange: ({ value }) => {
                          const { width, height } =
                            advancedTransforms.changeUnit({ unit: value });
                          group.setFieldValue('width', String(width), {
                            dontRunListeners: true,
                          });
                          group.setFieldValue('height', String(height), {
                            dontRunListeners: true,
                          });
                        },
                      }}
                    >
                      {(field) => (
                        <field.Select label="Unit" items={unitItems} />
                      )}
                    </group.AppField>
                    <Checkbox
                      label="Keep ratio"
                      checked={advancedTransforms.isAspectRatioEnabled}
                      onChange={(event) => {
                        advancedTransforms.enableAspectRatio(
                          event.currentTarget.checked,
                        );
                      }}
                    />
                    <group.Subscribe
                      selector={(state) => {
                        assert(state.values.mode === 'advance');
                        return state.values.unit;
                      }}
                    >
                      {(unit) => (
                        <>
                          <group.AppField
                            name="width"
                            listeners={{
                              onChange: ({ value }) => {
                                const height = advancedTransforms.changeSize(
                                  Number(value),
                                  'height',
                                  'width',
                                );
                                if (!advancedTransforms.isAspectRatioEnabled) {
                                  return;
                                }
                                group.setFieldValue('height', String(height), {
                                  dontRunListeners: true,
                                });
                              },
                            }}
                          >
                            {(field) => (
                              <field.NumericInput
                                label="Width"
                                rightElement={<Tag>{unit}</Tag>}
                              />
                            )}
                          </group.AppField>
                          <group.AppField
                            name="height"
                            listeners={{
                              onChange: ({ value }) => {
                                const width = advancedTransforms.changeSize(
                                  Number(value),
                                  'width',
                                  'height',
                                );
                                if (!advancedTransforms.isAspectRatioEnabled) {
                                  return;
                                }
                                group.setFieldValue('width', String(width), {
                                  dontRunListeners: true,
                                });
                              },
                            }}
                          >
                            {(field) => (
                              <field.NumericInput
                                label="Height"
                                rightElement={<Tag>{unit}</Tag>}
                              />
                            )}
                          </group.AppField>
                        </>
                      )}
                    </group.Subscribe>
                  </>
                );
              default:
                assertUnreachable(mode);
            }
          }}
        </group.Subscribe>
        <group.AppField
          name="dpi"
          listeners={{
            onChange: ({ value }) => {
              if (group.state.values.mode !== 'advance') return;
              if (group.state.values.unit !== 'px') return;

              const { width, height } = advancedTransforms.changeDPI(value);
              group.setFieldValue('width', String(width), {
                dontRunListeners: true,
              });
              group.setFieldValue('height', String(height), {
                dontRunListeners: true,
              });
            },
          }}
        >
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
  /* eslint-enable react-hooks/rules-of-hooks */
});

import { Checkbox, Tag } from '@blueprintjs/core';
import { useStore } from '@tanstack/react-form';
import type { PageSizeName, Unit } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { memo, useMemo } from 'react';
import { FormGroup, assertUnreachable, withFieldGroup } from 'react-science/ui';
import type { z } from 'zod/v4';

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
const layoutItems: Array<SelectItem<Layout>> = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

export const ExportFields = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.export.png,
  render: ({ group }) => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const inputValues = useStore(group.store, (s) => s.values);
    const outputValues = useMemo(() => {
      return exportSettingsValidation.decode(inputValues);
    }, [inputValues]);
    const advancedTransforms = useExportConfigurer(outputValues);
    /* eslint-enable react-hooks/rules-of-hooks */

    function onModeChange({ value }: { value: Mode }) {
      const newOptions = getExportDefaultOptionsByMode(value);

      for (const [key, value] of Object.entries(newOptions)) {
        group.setFieldValue(key as keyof typeof newOptions, value, {
          dontRunListeners: true,
        });
      }
    }

    function onChangeUnit({ value }: { value: Unit }) {
      const { width, height } = advancedTransforms.changeUnit({ unit: value });
      group.setFieldValue('width', String(width), {
        dontRunListeners: true,
      });
      group.setFieldValue('height', String(height), {
        dontRunListeners: true,
      });
    }
    function onWidthChange({ value }: { value: string }) {
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
    }
    function onHeightChange({ value }: { value: string }) {
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
    }

    function onDPIChange({ value }: { value: string }) {
      if (group.state.values.mode !== 'advance') return;
      if (group.state.values.unit !== 'px') return;

      const { width, height } = advancedTransforms.changeDPI(Number(value));
      group.setFieldValue('width', String(width), {
        dontRunListeners: true,
      });
      group.setFieldValue('height', String(height), {
        dontRunListeners: true,
      });
    }

    return (
      <>
        <group.AppField name="mode" listeners={{ onChange: onModeChange }}>
          {(field) => <field.RadioGroup label="Mode" options={modeItems} />}
        </group.AppField>
        <DescriptionPreview {...outputValues} />
        <group.Subscribe
          selector={(state) => {
            const mode = state.values.mode;
            switch (state.values.mode) {
              case 'basic':
                return { mode: state.values.mode, layout: state.values.layout };
              case 'advance':
                return { mode: state.values.mode, unit: state.values.unit };
              default:
                assertUnreachable(mode as never);
            }
          }}
        >
          {({ mode, layout, unit }) => {
            switch (mode) {
              case 'basic':
                return (
                  <>
                    <group.AppField name="size">
                      {(field) => (
                        <field.Select
                          label="Size"
                          items={pageSizeItems[layout]}
                        />
                      )}
                    </group.AppField>
                    <group.AppField name="layout">
                      {(field) => (
                        <field.RadioGroup
                          label="Layout"
                          options={layoutItems}
                        />
                      )}
                    </group.AppField>
                  </>
                );
              case 'advance':
                return (
                  <>
                    <group.AppField
                      name="unit"
                      listeners={{ onChange: onChangeUnit }}
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
                    <group.AppField
                      name="width"
                      listeners={{ onChange: onWidthChange }}
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
                      listeners={{ onChange: onHeightChange }}
                    >
                      {(field) => (
                        <field.NumericInput
                          label="Height"
                          rightElement={<Tag>{unit}</Tag>}
                        />
                      )}
                    </group.AppField>
                  </>
                );
              default:
                assertUnreachable(mode);
            }
          }}
        </group.Subscribe>
        <group.AppField name="dpi" listeners={{ onChange: onDPIChange }}>
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

type DescriptionPreviewProps = z.output<typeof exportSettingsValidation>;
const DescriptionPreview = memo(function DescriptionPreview(
  props: DescriptionPreviewProps,
) {
  const { width, height, dpi, unit } = getExportOptions(props);
  const convertOptions = { precision: 0 };
  const widthInPixel = convertToPixels(width, unit, dpi, convertOptions);
  const heightInPixel = convertToPixels(height, unit, dpi, convertOptions);

  return (
    <FormGroup label="Description">
      <Tag>{`${widthInPixel} px x ${heightInPixel} px @ ${dpi}DPI`}</Tag>
    </FormGroup>
  );
});

import { Checkbox, Tag } from '@blueprintjs/core';
import { useStore } from '@tanstack/react-form';
import type { PageSizeName, Unit } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { memo, useMemo } from 'react';
import { FormGroup, assertUnreachable, withFieldGroup } from 'react-science/ui';
import type { z } from 'zod/v4';

import { convertToPixels } from '../../../../elements/export/units.js';
import { useExportConfigurer } from '../../../../elements/export/useExportConfigurer.js';
import {
  getExportDefaultOptionsByMode,
  getExportOptions,
} from '../../../../elements/export/utilities/getExportOptions.js';
import { pageSizes } from '../../../../elements/print/pageSize.js';
import { exportSettingsValidation } from '../validation/export_tab_validation.js';
import { defaultGeneralSettingsFormValues } from '../validation.js';

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
  render: function ExportFields({ group }) {
    const inputValues = useStore(group.store, (s) => s.values);
    const outputValues = useMemo(() => {
      return exportSettingsValidation.decode(inputValues);
    }, [inputValues]);
    const advancedTransforms = useExportConfigurer(outputValues);

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

    const { AppField, Subscribe } = group;
    return (
      <>
        <AppField name="mode" listeners={{ onChange: onModeChange }}>
          {({ RadioGroup }) => <RadioGroup label="Mode" options={modeItems} />}
        </AppField>
        <DescriptionPreview {...outputValues} />
        <Subscribe
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
                    <AppField name="size">
                      {({ Select }) => (
                        <Select label="Size" items={pageSizeItems[layout]} />
                      )}
                    </AppField>
                    <AppField name="layout">
                      {({ RadioGroup }) => (
                        <RadioGroup label="Layout" options={layoutItems} />
                      )}
                    </AppField>
                  </>
                );
              case 'advance':
                return (
                  <>
                    <AppField
                      name="unit"
                      listeners={{ onChange: onChangeUnit }}
                    >
                      {({ Select }) => (
                        <Select label="Unit" items={unitItems} />
                      )}
                    </AppField>
                    <Checkbox
                      label="Keep ratio"
                      checked={advancedTransforms.isAspectRatioEnabled}
                      onChange={(event) => {
                        advancedTransforms.enableAspectRatio(
                          event.currentTarget.checked,
                        );
                      }}
                    />
                    <AppField
                      name="width"
                      listeners={{ onChange: onWidthChange }}
                    >
                      {({ NumericInput }) => (
                        <NumericInput
                          label="Width"
                          rightElement={<Tag>{unit}</Tag>}
                        />
                      )}
                    </AppField>
                    <AppField
                      name="height"
                      listeners={{ onChange: onHeightChange }}
                    >
                      {({ NumericInput }) => (
                        <NumericInput
                          label="Height"
                          rightElement={<Tag>{unit}</Tag>}
                        />
                      )}
                    </AppField>
                  </>
                );
              default:
                assertUnreachable(mode);
            }
          }}
        </Subscribe>
        <AppField name="dpi" listeners={{ onChange: onDPIChange }}>
          {({ NumericInput }) => <NumericInput label="DPI" />}
        </AppField>
        <AppField name="useDefaultSettings">
          {({ Checkbox }) => (
            <Checkbox label="Don't show the options dialog during export and use current settings" />
          )}
        </AppField>
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

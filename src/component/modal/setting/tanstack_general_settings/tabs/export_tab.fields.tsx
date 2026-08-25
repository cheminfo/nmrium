import { Checkbox, Tag } from '@blueprintjs/core';
import { useSelector } from '@tanstack/react-store';
import type { PageSizeName, Unit } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { assertUnreachable } from '@zakodium/utils';
import { memo, useMemo } from 'react';
import { FormGroup, withFieldGroup } from 'react-science/ui';
import type { z } from 'zod/v4';

import { convertToPixels } from '../../../../elements/export/units.js';
import { useExportConfigurer } from '../../../../elements/export/useExportConfigurer.js';
import {
  getExportDefaultOptionsByMode,
  getExportOptions,
} from '../../../../elements/export/utilities/getExportOptions.js';
import { pageSizes } from '../../../../elements/print/pageSize.js';
import {
  MAX_DPI,
  MIN_DPI,
  dpiField,
  exportSettingsDecoder,
  exportSettingsValidation,
  sizeField,
} from '../validation/export_tab_validation.js';
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

/** Returns null for values the schema rejects */
function parsePositiveNumber(str: string) {
  const value = Number(str);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export const ExportFields = withFieldGroup({
  defaultValues: defaultGeneralSettingsFormValues.export.png,
  render: function ExportFields({ group }) {
    const inputValues = useSelector(group.store, (s) => s.values);

    const outputValues = useMemo(() => {
      return exportSettingsDecoder.decode(inputValues);
    }, [inputValues]);

    const advancedTransforms = useExportConfigurer(outputValues);

    function onModeChange({ value }: { value: Mode }) {
      const defaultOptions = getExportDefaultOptionsByMode(value);
      const newOptions = exportSettingsValidation.encode(defaultOptions);

      for (const [key, value] of Object.entries(newOptions)) {
        group.setFieldValue(key as keyof typeof newOptions, value, {
          dontRunListeners: true,
        });
      }
      // keep the aspect ratio if the options is activated
      advancedTransforms.resetSize(defaultOptions);
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
      const width = parsePositiveNumber(value);
      if (width === null) return;

      const height = advancedTransforms.changeSize(width, 'height', 'width');
      if (!advancedTransforms.isAspectRatioEnabled) {
        return;
      }
      group.setFieldValue('height', String(height), {
        dontRunListeners: true,
      });
    }

    function onHeightChange({ value }: { value: string }) {
      const height = parsePositiveNumber(value);
      if (height === null) return;

      const width = advancedTransforms.changeSize(height, 'width', 'height');
      if (!advancedTransforms.isAspectRatioEnabled) {
        return;
      }
      group.setFieldValue('width', String(width), {
        dontRunListeners: true,
      });
    }

    function onDPIChange({ value }: { value: string }) {
      if (inputValues.mode !== 'advance') return;
      if (inputValues.unit !== 'px') return;

      const dpi = parsePositiveNumber(value);
      if (dpi === null || dpi < MIN_DPI || dpi > MAX_DPI) return;

      const { width, height } = advancedTransforms.changeDPI(dpi);
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
            switch (mode) {
              case 'basic':
                return { mode, layout: state.values.layout };
              case 'advance':
                return { mode, unit: state.values.unit };
              default:
                assertUnreachable(mode);
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
                      validators={{ onChange: sizeField }}
                    >
                      {({ NumericInput }) => (
                        <NumericInput
                          label="Width"
                          min={0}
                          rightElement={<Tag>{unit}</Tag>}
                        />
                      )}
                    </AppField>
                    <AppField
                      name="height"
                      listeners={{ onChange: onHeightChange }}
                      validators={{ onChange: sizeField }}
                    >
                      {({ NumericInput }) => (
                        <NumericInput
                          label="Height"
                          min={0}
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
        <AppField
          name="dpi"
          listeners={{ onChange: onDPIChange }}
          validators={{ onChange: dpiField }}
        >
          {({ NumericInput }) => (
            <NumericInput label="DPI" min={MIN_DPI} max={MAX_DPI} />
          )}
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

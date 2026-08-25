import type { Layout, PageSizeName } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { coerceNumberInput } from 'react-science/ui';
import { z } from 'zod';

import { convert, convertToPixels } from '../../../../elements/export/units.js';
import {
  MAX_CANVAS_AREA,
  MAX_CANVAS_SIDE,
} from '../../../../utility/export.ts';

const exportSizes: PageSizeName[] = [
  'Letter',
  'Legal',
  'Tabloid',
  'Executive',
  'Statement',
  'Folio',
  'A3',
  'A4',
  'A5',
  'B4',
  'B5',
];
const exportLayouts: Layout[] = ['portrait', 'landscape'];

export const MIN_DPI = 1;
export const MAX_DPI = 1200;

const formatNumber = (value: number) => value.toLocaleString('en-US');

/** Sizes are unit-relative (m, in, cm, px...), so the only unit-agnostic invariant is being positive. */
export const sizeField = coerceNumberInput(z.number().positive());
export const dpiField = coerceNumberInput(
  z.number().int().min(MIN_DPI).max(MAX_DPI),
);

type NumberField = ReturnType<typeof coerceNumberInput>;
type Side = 'width' | 'height';

const sides: Side[] = ['width', 'height'];

/** @see {import("@zakodium/nmrium-core").BasicExportSettings} */
function basicSettings(dpi: NumberField) {
  return z.object({
    mode: z.literal('basic'),
    useDefaultSettings: z.boolean(),
    dpi,
    size: z.enum(exportSizes),
    layout: z.enum(exportLayouts),
  });
}

/** @see {import("@zakodium/nmrium-core").AdvanceExportSettings} */
function advancedSettings(size: NumberField, dpi: NumberField) {
  return z.object({
    mode: z.literal('advance'),
    useDefaultSettings: z.boolean(),
    dpi,
    width: size,
    height: size,
    unit: z.enum(units.map((u) => u.unit)),
  });
}

type AdvancedSettings = z.output<ReturnType<typeof advancedSettings>>;

/** A canvas the browser cannot allocate makes the export fail, so the real limit is the size in pixels. */
function getSizeErrors(settings: AdvancedSettings) {
  const { unit, dpi, width, height } = settings;
  const pixels = {
    width: convertToPixels(width, unit, dpi, { precision: 0 }),
    height: convertToPixels(height, unit, dpi, { precision: 0 }),
  };

  function inCurrentUnit(px: number) {
    if (unit === 'px') return `${formatNumber(px)} px`;
    return `${convert(px, 'px', unit, dpi, { precision: 2 })} ${unit}`;
  }

  const errors: Partial<Record<Side, string>> = {};

  for (const side of sides) {
    if (pixels[side] < 1) {
      errors[side] = `Too small to export. Use at least ${inCurrentUnit(1)}.`;
    } else if (pixels[side] > MAX_CANVAS_SIDE) {
      errors[side] =
        `Too large to export. Use at most ${inCurrentUnit(MAX_CANVAS_SIDE)}.`;
    }
  }

  const hasSideError = sides.some((side) => errors[side]);
  if (!hasSideError && pixels.width * pixels.height > MAX_CANVAS_AREA) {
    const message = `The export would be ${formatNumber(pixels.width)} x ${formatNumber(pixels.height)} pixels, which is too large. Try a smaller size or a lower DPI.`;
    errors.width = message;
    errors.height = message;
  }

  return errors;
}

/**
 * @see {import("@zakodium/nmrium-core").ExportSettings}
 */
export const exportSettingsValidation = z.discriminatedUnion('mode', [
  basicSettings(dpiField),
  advancedSettings(sizeField, dpiField).check(({ value, issues }) => {
    const errors = getSizeErrors(value);

    for (const side of sides) {
      const message = errors[side];
      if (!message) continue;

      issues.push({
        code: 'custom',
        input: value[side],
        path: [side],
        message,
      });
    }
  }),
]);

export const exportSettingsDecoder = z.discriminatedUnion('mode', [
  basicSettings(coerceNumberInput()),
  advancedSettings(coerceNumberInput(), coerceNumberInput()),
]);

/**
 * @see {import("@zakodium/nmrium-core").ExportPreferences}
 */
export const exportPreferencesValidation = z.object({
  png: exportSettingsValidation,
  svg: exportSettingsValidation,
  clipboard: exportSettingsValidation,
});

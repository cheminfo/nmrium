import type { Layout, PageSizeName } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { z } from 'zod';

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

/**
 * @see {import("@zakodium/nmrium-core").BaseExportSettings}
 */
const baseExportSettings = z.object({
  useDefaultSettings: z.boolean(),
  dpi: z.coerce.number<string>(),
});

/**
 * @see {import("@zakodium/nmrium-core").BasicExportSettings}
 */
const basicExportSettings = z.object({
  mode: z.literal('basic'),
  ...baseExportSettings.shape,
  size: z.enum(exportSizes),
  layout: z.enum(exportLayouts),
});
/**
 * @see {import("@zakodium/nmrium-core").AdvanceExportSettings}
 */
const advancedExportSettings = z.object({
  mode: z.literal('advance'),
  ...baseExportSettings.shape,
  width: z.coerce.number<string>(),
  height: z.coerce.number<string>(),
  unit: z.enum(units.map((u) => u.unit)),
});

/**
 * @see {import("@zakodium/nmrium-core").ExportSettings}
 */
export const exportSettingsValidation = z.discriminatedUnion('mode', [
  basicExportSettings,
  advancedExportSettings,
]);

/**
 * @see {import("@zakodium/nmrium-core").ExportPreferences}
 */
export const exportPreferencesValidation = z.object({
  png: exportSettingsValidation,
  svg: exportSettingsValidation,
  clipboard: exportSettingsValidation,
});

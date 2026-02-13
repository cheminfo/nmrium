import type { Layout, PageSizeName } from '@zakodium/nmrium-core';
import { units } from '@zakodium/nmrium-core';
import { z } from 'zod/v4';

import type { LoggerType } from '../../../context/LoggerContext.tsx';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.ts';

const loggingLevel: LoggerType[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];

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

const peaksLabelValidation = z.object({
  marginTop: z.coerce.number().int().min(0),
});

const generalValidation = z.object({
  dimmedSpectraOpacity: z.coerce.number().min(0).max(1),
  invert: z.boolean(),
  invertScroll: z.boolean(),
  spectraRendering: z.enum([
    'auto',
    'optimizeSpeed',
    'crispEdges',
    'geometricPrecision',
  ]),
  popupLoggingLevel: z.enum(loggingLevel).optional(),
  loggingLevel: z.enum(loggingLevel).optional(),
});

const displayValidation = z.object({
  general: z.object({
    experimentalFeatures: z.object({
      display: z.boolean(),
    }),
  }),
});

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
const exportPreferencesValidation = z.object({
  png: exportSettingsValidation,
  svg: exportSettingsValidation,
  clipboard: exportSettingsValidation,
});

export const nmrLoadersGeneralDataSelection = [
  { label: 'FT', value: 'ft' } as const,
  { label: 'FID', value: 'fid' } as const,
  { label: 'Both', value: 'both' } as const,
  { label: 'Prefer FT', value: 'preferFT' } as const,
  { label: 'Prefer FID', value: 'preferFID' } as const,
];

const nmrLoadersGeneralValidation = z.object({
  dataSelection: z
    .enum(nmrLoadersGeneralDataSelection.map(({ value }) => value))
    .optional(),
  keep1D: z.boolean().optional(),
  keep2D: z.boolean().optional(),
  onlyReal: z.boolean().optional(),
});
const nmrLoadersBrukerValidation = z.object({
  processingNumbers: z.string().optional(),
  experimentNumbers: z.string().optional(),
  onlyFirstProcessedData: z.boolean().optional(),
});
const nmrLoadersValidation = z.object({
  general: nmrLoadersGeneralValidation,
  bruker: nmrLoadersBrukerValidation,
});

export const workspaceValidation = z.object({
  peaksLabel: peaksLabelValidation,
  general: generalValidation,
  display: displayValidation,
  nmrLoaders: nmrLoadersValidation,
  export: exportPreferencesValidation,
});

// This object is used to define type not real values. Do not use it as values
export const defaultGeneralSettingsFormValues: z.input<
  typeof workspaceValidation
> = {
  peaksLabel: {
    marginTop: 0,
  },
  general: {
    dimmedSpectraOpacity: 0,
    invert: false,
    invertScroll: false,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'info',
  },
  display: {
    general: {
      experimentalFeatures: {
        display: false,
      },
    },
  },
  nmrLoaders: nmrLoadersValidation.encode(
    workspaceDefaultProperties.nmrLoaders,
  ),
  export: exportPreferencesValidation.encode(workspaceDefaultProperties.export),
};

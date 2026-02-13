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

const displayGeneralValidation = z.object({
  experimentalFeatures: z.object({
    display: z.boolean(),
  }),
  hidePanelsBar: z.boolean().optional(),
});

export const displayPanelsStatus = [
  { label: 'Hidden', value: 'hidden' } as const,
  { label: 'Available', value: 'available' } as const,
  { label: 'Active', value: 'active' } as const,
  { label: 'Open', value: 'open' } as const,
];
type PanelStatus = (typeof displayPanelsStatus)[number]['value'];
const panelStatusValidation = z.enum(displayPanelsStatus.map((s) => s.value));
const panelCodec = z.codec(
  panelStatusValidation,
  z
    .object({
      display: z.boolean(),
      visible: z.boolean(),
      open: z.boolean().optional(),
    })
    .optional(),
  {
    encode: (status) => {
      const { display = false, visible = false, open = false } = status ?? {};
      let value: PanelStatus = 'hidden';
      const isActive = visible && display;

      if (isActive && open) {
        value = 'open';
      } else if (isActive) {
        value = 'active';
      } else if (visible) {
        value = 'available';
      }

      return value;
    },
    decode: (status) => {
      let visible = false;
      let display = false;
      let open = false;

      if (status === 'available') {
        visible = true;
      }

      if (status === 'active') {
        visible = true;
        display = true;
      }
      if (status === 'open') {
        visible = true;
        display = true;
        open = true;
      }

      return { open, visible, display };
    },
  },
);

const displayPanelsValidation = z
  .object({
    spectraPanel: panelCodec,
    informationPanel: panelCodec,
    peaksPanel: panelCodec,
    integralsPanel: panelCodec,
    rangesPanel: panelCodec,
    structuresPanel: panelCodec,
    processingsPanel: panelCodec,
    zonesPanel: panelCodec,
    summaryPanel: panelCodec,
    multipleSpectraAnalysisPanel: panelCodec,
    databasePanel: panelCodec,
    predictionPanel: panelCodec,
    automaticAssignmentPanel: panelCodec,
    matrixGenerationPanel: panelCodec,
    simulationPanel: panelCodec,
  })
  .optional();

const displayValidation = z.object({
  general: displayGeneralValidation,
  panels: displayPanelsValidation,
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

export const workspaceValidation = z.object({
  peaksLabel: peaksLabelValidation,
  general: generalValidation,
  display: displayValidation,
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
    panels: displayPanelsValidation.encode(
      workspaceDefaultProperties.display.panels,
    ),
  },
  export: exportPreferencesValidation.encode(workspaceDefaultProperties.export),
};

import { z } from 'zod';

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

export const displayPanelsValidation = z
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

import { InnerWorkspace } from './Workspace';

export const process1D: InnerWorkspace = {
  version: 1,
  label: 'Process 1D workspace',
  display: {
    general: {},

    panels: {
      zonesPanel: { display: true },
      summaryPanel: { display: true },
      multipleSpectraAnalysisPanel: { display: true, open: true },
      spectraPanel: { display: true, open: true },
    },

    toolBarButtons: {
      baselineCorrectionTool: true,
      FFTTool: true,
      integralTool: true,
      phaseCorrectionTool: true,
      realImaginary: true,
      slicingTool: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      apodizationTool: true,
      zeroFillingTool: true,
      zonePickingTool: true,
      zoomOutTool: true,
      zoomTool: true,
    },
  },
};

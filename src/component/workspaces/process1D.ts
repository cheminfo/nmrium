import { InnerWorkspace } from './Workspace';

export const process1D: InnerWorkspace = {
  version: 2,
  label: '1D multiple spectra analysis',
  display: {
    general: {},

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true },
      peaksPanel: { display: true },
      filtersPanel: { display: true },
      multipleSpectraAnalysisPanel: { display: true },
    },

    toolBarButtons: {
      zoomTool: true,
      zoomOutTool: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      peakTool: true,
      apodizationTool: true,
      zeroFillingTool: true,
      FFTTool: true,
      phaseCorrectionTool: true,
      baselineCorrectionTool: true,
      exclusionZonesTool: true,
      multipleSpectraAnalysisTool: true,
    },
  },
};

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
      zoom: true,
      zoomOut: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      peakPicking: true,
      apodization: true,
      zeroFilling: true,
      fastFourierTransform: true,
      phaseCorrection: true,
      baselineCorrection: true,
      exclusionZones: true,
      multipleSpectraAnalysis: true,
    },
  },
};

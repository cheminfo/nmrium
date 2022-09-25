import { InnerWorkspace } from './Workspace';

export const exercise: InnerWorkspace = {
  version: 2,
  label: 'Exercise',
  display: {
    general: {
      hideGeneralSettings: true,
    },

    panels: {
      spectraPanel: { display: true, open: true },
      integralsPanel: { display: true },
    },

    toolBarButtons: {
      zoom: true,
      zoomOut: true,
      apodization: true,
      zeroFilling: true,
      fastFourierTransform: true,
      phaseCorrection: true,
      baselineCorrection: true,
      peakPicking: true,
      integral: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
    },
  },
};

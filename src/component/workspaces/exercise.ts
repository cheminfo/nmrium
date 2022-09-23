import { InnerWorkspace } from './Workspace';

export const exercise: InnerWorkspace = {
  version: 1,
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
      peakPicking: true,
      apodization: true,
      zeroFilling: true,
      fastFourierTransform: true,
      phaseCorrection: true,
      baselineCorrection: true,
      integral: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zoomOut: true,
      zoom: true,
    },
  },
};

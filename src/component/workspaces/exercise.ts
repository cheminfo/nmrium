import { InnerWorkspace } from './Workspace';

export const exercise: InnerWorkspace = {
  version: 2,
  label: 'Exercise',
  display: {
    general: {
      hideGeneralSettings: true,
      hideLogs: true,
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
      fft: true,
      phaseCorrection: true,
      baselineCorrection: true,
      peakPicking: true,
      integral: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
    },
  },
  general: {
    dimmedSpectraOpacity: 0.1,
    verticalSplitterPosition: '440px',
    verticalSplitterCloseThreshold: 600,
    spectraRendering: 'auto',
    loggingLevel: 'info',
  },
};

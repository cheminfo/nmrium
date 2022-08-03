import { InnerWorkspace } from './Workspace';

export const basic: InnerWorkspace = {
  version: 2,
  label: 'Default workspace',
  display: {
    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: true, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
    },
    toolBarButtons: {
      zoom: true,
      zoomOut: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      realImaginary: true,
      peakPicking: true,
      integral: true,
      zonePicking: true,
      rangePicking: true,
      slicing: true,
      apodization: true,
      zeroFilling: true,
      FFT: true,
      phaseCorrection: true,
      baselineCorrection: true,
    },
  },
};

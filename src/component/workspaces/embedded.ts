import { InnerWorkspace } from './Workspace';

export const embedded: InnerWorkspace = {
  version: 1,
  label: 'Embedded',
  display: {
    general: {
      experimentalFeatures: { display: true },
      hidePanelOnLoad: true,
    },

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
      baselineCorrection: true,
      exclusionZones: true,
      exportAs: true,
      fastFourierTransform: true,
      import: true,
      integral: true,
      multipleSpectraAnalysis: true,
      phaseCorrection: true,
      rangePicking: true,
      realImaginary: true,
      slicing: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      apodization: true,
      zeroFilling: true,
      zonePicking: true,
      zoomOut: true,
      zoom: true,
    },
  },
};

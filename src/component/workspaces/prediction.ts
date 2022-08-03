import { InnerWorkspace } from './Workspace';

export const prediction: InnerWorkspace = {
  version: 1,
  label: 'Prediction',
  display: {
    panels: {
      spectraPanel: { display: true },
      rangesPanel: { display: true },
      zonesPanel: { display: true },
      predictionPanel: { display: true, open: true },
    },
    toolBarButtons: {
      baselineCorrection: true,
      exclusionZones: true,
      exportAs: true,
      FFT: true,
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

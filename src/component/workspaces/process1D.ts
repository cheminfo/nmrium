import type { InnerWorkspace } from '@zakodium/nmrium-core';

export const process1D: InnerWorkspace = {
  label: '1D multiple spectra analysis',
  visible: true,
  display: {
    general: {},

    panels: {
      spectraPanel: { display: true, visible: true, open: true },
      informationPanel: { display: true, visible: true },
      peaksPanel: { display: true, visible: true },
      processingsPanel: { display: true, visible: true },
      multipleSpectraAnalysisPanel: { display: true, visible: true },
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
      fft: true,
      phaseCorrection: true,
      baselineCorrection: true,
      exclusionZones: true,
      multipleSpectraAnalysis: true,
      autoRangeAndZonePicking: true,
      fftDimension1: true,
      fftDimension2: true,
      inset: true,
    },
  },
};

import { InnerWorkspace } from 'nmr-load-save';

export const process1D: InnerWorkspace = {
  version: 2,
  label: '1D multiple spectra analysis',
  visible: true,
  display: {
    general: {},

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true },
      peaksPanel: { display: true },
      processingsPanel: { display: true },
      multipleSpectraAnalysisPanel: { display: true },
      matrixGenerationPanel: { display: true },
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
    },
  },
};

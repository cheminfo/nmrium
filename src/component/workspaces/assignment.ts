import type { InnerWorkspace } from 'nmrium-core';

export const assignment: InnerWorkspace = {
  label: 'NMR spectra assignment',
  visible: true,
  display: {
    panels: {
      spectraPanel: { display: true, visible: true, open: true },
      informationPanel: { display: true, visible: true, open: false },
      rangesPanel: { display: true, visible: true, open: false },
      structuresPanel: { display: true, visible: true, open: false },
      processingsPanel: { display: true, visible: true, open: false },
      zonesPanel: { display: true, visible: true, open: false },
    },
    toolBarButtons: {
      zoom: true,
      zoomOut: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      realImaginary: true,
      zonePicking: true,
      rangePicking: true,
      slicing: true,
      apodization: true,
      zeroFilling: true,
      fft: true,
      phaseCorrection: true,
      baselineCorrection: true,
      autoRangeAndZonePicking: true,
    },
  },
};

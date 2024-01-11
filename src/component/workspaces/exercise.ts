import { InnerWorkspace } from 'nmr-load-save';

export const exercise: InnerWorkspace = {
  version: 2,
  label: 'Exercise',
  display: {
    general: {
      hideGeneralSettings: true,
      hideLogs: true,
      hideWorkspaces: true,
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
      fftDimension1: true,
      fftDimension2: true,
    },
  },
  general: {
    dimmedSpectraOpacity: 0.1,
    verticalSplitterPosition: '440px',
    verticalSplitterCloseThreshold: 600,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    invert: false,
  },
  formatting: {
    nuclei: {},
    panels: {
      integrals: {
        nuclei: {
          '1H': {
            showSerialNumber: true,
            relative: { show: true, format: '0.00' },
            absolute: { show: false, format: '0.00' },
            from: { show: true, format: '0.00' },
            to: { show: true, format: '0.00' },
            color: 'black',
            strokeWidth: 1,
            showKind: false,
            showDeleteAction: true,
          },
          '13C': {
            showSerialNumber: true,
            relative: { show: true, format: '0.00' },
            absolute: { show: false, format: '0.00' },
            from: { show: true, format: '0.00' },
            to: { show: true, format: '0.00' },
            color: 'black',
            strokeWidth: 1,
            showKind: false,
            showDeleteAction: true,
          },
        },
      },
    },
  },
};

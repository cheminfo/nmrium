import type { InnerWorkspace } from '@zakodium/nmrium-core';

export const simulation: InnerWorkspace = {
  label: 'Simulation',
  general: {
    dimmedSpectraOpacity: 0.5,
    verticalSplitterPosition: '440px',
    verticalSplitterCloseThreshold: 600,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'error',
    invert: true,
    invertScroll: false,
    molecules: {
      labelStyle: {
        fontSize: 15,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: '#8A3B3B',
      },
    },
  },
  display: {
    general: {
      hideGeneralSettings: true,
      hideLogs: true,
      hideWorkspaces: true,
    },
    panels: {
      spectraPanel: { display: true, visible: true },
      simulationPanel: { display: true, visible: true, open: true },
    },
    toolBarButtons: {
      exportAs: true,
      import: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zoomOut: true,
      zoom: true,
    },
  },
  nuclei: [],
  panels: {
    spectra: {
      nuclei: {
        '1H': {
          columns: [
            {
              name: 'visible',
              label: '',
              description: 'Show/Hide Spectrum',
              visible: true,
            },
            {
              label: 'Spectrum Name',
              jpath: ['info', 'name'],
              visible: true,
            },
            {
              label: 'Frequency',
              description: 'frequency',
              jpath: ['info', 'originFrequency'],
              visible: true,
            },
            {
              jpath: ['info', 'nucleus'],
              label: 'Experiment',
              visible: true,
            },
            {
              name: 'color',
              label: '',
              description: 'Spectrum Color',
              visible: true,
            },
          ],
        },
      },
    },
  },
};

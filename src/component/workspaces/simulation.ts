import { InnerWorkspace } from 'nmr-load-save';

export const simulation: InnerWorkspace = {
  version: 1,
  label: 'Simulation',
  general: {
    dimmedSpectraOpacity: 0.5,
    verticalSplitterPosition: '440px',
    verticalSplitterCloseThreshold: 600,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    invert: false,
  },
  display: {
    general: {
      hideGeneralSettings: true,
      hideLogs: true,
      hideWorkspaces: true,
    },
    panels: {
      spectraPanel: { display: true },
      simulationPanel: { display: true, open: true },
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
  formatting: {
    nuclei: {},
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
                name: 'name',
                label: 'Spectrum Name',
                description: 'Spectrum Name',
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
  },
};

import type { InnerWorkspace } from '@zakodium/nmrium-core';

export const prediction: InnerWorkspace = {
  label: 'Prediction',
  general: {
    dimmedSpectraOpacity: 0.5,
    verticalSplitterPosition: '440px',
    verticalSplitterCloseThreshold: 600,
    spectraRendering: 'auto',
    loggingLevel: 'info',
    popupLoggingLevel: 'error',
    invertScroll: false,
    invert: true,
  },
  display: {
    general: {
      hideGeneralSettings: true,
      hideLogs: true,
      hideWorkspaces: true,
    },
    panels: {
      spectraPanel: { display: true, visible: true, open: false },
      rangesPanel: { display: true, visible: true },
      zonesPanel: { display: true, visible: true },
      predictionPanel: { display: true, visible: true, open: true },
    },
    toolBarButtons: {
      baselineCorrection: true,
      exclusionZones: true,
      exportAs: true,
      fft: true,
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
      autoRangeAndZonePicking: true,
      fftDimension1: true,
      fftDimension2: true,
      apodizationDimension1: true,
      apodizationDimension2: true,
      phaseCorrectionTwoDimensions: true,
      zeroFillingDimension1: true,
      zeroFillingDimension2: true,
      inset: true,
    },
  },
  nuclei: [],
  panels: {
    spectra: {
      nuclei: {
        '1H,1H': {
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
              jpath: ['info', 'baseFrequency'],
              visible: true,
            },
            {
              label: 'Solvent',
              jpath: ['info', 'solvent'],
              visible: false,
            },
            {
              jpath: ['info', 'pulseSequence'],
              label: 'Pulse',
              visible: true,
            },
            {
              jpath: ['info', 'experiment'],
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
        '1H,13C': {
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
              jpath: ['info', 'baseFrequency'],
              visible: true,
            },
            {
              label: 'Solvent',
              jpath: ['info', 'solvent'],
              visible: false,
            },
            {
              jpath: ['info', 'pulseSequence'],
              label: 'Pulse',
              visible: true,
            },
            {
              jpath: ['info', 'experiment'],
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
              jpath: ['info', 'baseFrequency'],
              visible: true,
            },
            {
              label: 'Solvent',
              jpath: ['info', 'solvent'],
              visible: false,
            },
            {
              jpath: ['info', 'pulseSequence'],
              label: 'Pulse',
              visible: true,
            },
            {
              jpath: ['info', 'experiment'],
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
        '13C': {
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
              jpath: ['info', 'baseFrequency'],
              visible: true,
            },
            {
              label: 'Solvent',
              jpath: ['info', 'solvent'],
              visible: false,
            },
            {
              jpath: ['info', 'pulseSequence'],
              label: 'Pulse',
              visible: true,
            },
            {
              jpath: ['info', 'experiment'],
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

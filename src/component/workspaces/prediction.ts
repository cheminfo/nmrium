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
    },
  },
  formatting: {
    nuclei: {},
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
                name: 'name',
                label: 'Spectrum Name',
                description: 'Spectrum Name',
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
                name: 'solvent',
                label: 'Solvent',
                description: 'Solvent',
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
                name: 'name',
                label: 'Spectrum Name',
                description: 'Spectrum Name',
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
                name: 'solvent',
                label: 'Solvent',
                description: 'Solvent',
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
                name: 'name',
                label: 'Spectrum Name',
                description: 'Spectrum Name',
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
                name: 'solvent',
                label: 'Solvent',
                description: 'Solvent',
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
                name: 'name',
                label: 'Spectrum Name',
                description: 'Spectrum Name',
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
                name: 'solvent',
                label: 'Solvent',
                description: 'Solvent',
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
  },
};

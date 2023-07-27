import { CustomWorkspaces } from 'nmr-load-save';

import View from './View';

const customWorkspaces: CustomWorkspaces = {
  snapshots: {
    display: {
      general: {
        hideGeneralSettings: false,
        experimentalFeatures: {
          display: true,
        },
        hidePanelOnLoad: false,
      },
      panels: {
        spectraPanel: {
          display: true,
          open: true,
        },
        informationPanel: {
          display: true,
          open: false,
        },
        integralsPanel: {
          display: false,
          open: false,
        },
        rangesPanel: {
          display: true,
          open: false,
        },
        structuresPanel: {
          display: true,
          open: false,
        },
        processingsPanel: {
          display: true,
          open: false,
        },
        zonesPanel: {
          display: true,
          open: false,
        },
        automaticAssignmentPanel: {
          display: false,
          open: false,
        },
        databasePanel: {
          display: false,
          open: false,
        },
        multipleSpectraAnalysisPanel: {
          display: false,
          open: false,
        },
        peaksPanel: {
          display: false,
          open: false,
        },
        predictionPanel: {
          display: false,
          open: false,
        },
        summaryPanel: {
          display: false,
          open: false,
        },
      },
      toolBarButtons: {
        baselineCorrection: true,
        exclusionZones: false,
        exportAs: true,
        fft: true,
        import: true,
        integral: true,
        multipleSpectraAnalysis: false,
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
        peakPicking: true,
        autoRangeAndZonePicking: true,
      },
    },
    general: {
      dimmedSpectraOpacity: 0.1,
      verticalSplitterPosition: '364px',
      verticalSplitterCloseThreshold: 600,
      spectraRendering: 'auto',
      loggingLevel: 'info',
    },
    formatting: {
      nuclei: {
        '1h': {
          name: '1H',
          ppm: '0.00',
          hz: '0.00',
        },
        '13c': {
          name: '13C',
          ppm: '0.00',
          hz: '0.00',
        },
        '15n': {
          name: '15N',
          ppm: '0.00',
          hz: '0.00',
        },
        '19f': {
          name: '19F',
          ppm: '0.00',
          hz: '0.00',
        },
        '29si': {
          name: '29Si',
          ppm: '0.00',
          hz: '0.00',
        },
        '31p': {
          name: '31P',
          ppm: '0.00',
          hz: '0.00',
        },
      },
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
                  name: 'solvent',
                  label: 'Solvent',
                  description: 'Solvent',
                  jpath: ['info', 'solvent'],
                  visible: false,
                },
                {
                  jpath: ['info', 'pulseSequence'],
                  label: 'Pulse',
                  visible: false,
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
                  name: 'solvent',
                  label: 'Solvent',
                  description: 'Solvent',
                  jpath: ['info', 'solvent'],
                  visible: false,
                },
                {
                  jpath: ['info', 'pulseSequence'],
                  label: 'Pulse',
                  visible: false,
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
                  name: 'solvent',
                  label: 'Solvent',
                  description: 'Solvent',
                  jpath: ['info', 'solvent'],
                  visible: false,
                },
                {
                  jpath: ['info', 'pulseSequence'],
                  label: 'Pulse',
                  visible: false,
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
                  name: 'solvent',
                  label: 'Solvent',
                  description: 'Solvent',
                  jpath: ['info', 'solvent'],
                  visible: false,
                },
                {
                  jpath: ['info', 'pulseSequence'],
                  label: 'Pulse',
                  visible: false,
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
        ranges: {
          nuclei: {
            '1H': {
              from: {
                show: false,
                format: '0.00',
              },
              to: {
                show: false,
                format: '0.00',
              },
              absolute: {
                show: false,
                format: '0.00',
              },
              relative: {
                show: true,
                format: '0.00',
              },
              deltaPPM: {
                show: true,
                format: '0.00',
              },
              deltaHz: {
                show: false,
                format: '0.00',
              },
              coupling: {
                show: false,
                format: '0.00',
              },
              jGraphTolerance: 0.2,
              showKind: false,
            },
            '13C': {
              from: {
                show: false,
                format: '0.00',
              },
              to: {
                show: false,
                format: '0.00',
              },
              absolute: {
                show: false,
                format: '0.00',
              },
              relative: {
                show: true,
                format: '0.00',
              },
              deltaPPM: {
                show: true,
                format: '0.00',
              },
              deltaHz: {
                show: false,
                format: '0.00',
              },
              coupling: {
                show: true,
                format: '0.00',
              },
              jGraphTolerance: 2,
              showKind: true,
            },
          },
        },
      },
    },
    databases: {
      defaultDatabase: '',
      data: [
        {
          key: 'toc',
          label: 'Toc',
          url: 'https://data.cheminfo.org/nmr/database/toc.json',
          enabled: true,
        },
      ],
    },
    nmrLoaders: {
      general: {
        keep1D: true,
        keep2D: true,
        onlyReal: false,
        dataSelection: 'preferFT',
      },
      bruker: {
        onlyFirstProcessedData: true,
      },
    },
    infoBlock: {
      visible: false,
      fields: [
        { label: 'name', jpath: ['info', 'name'], visible: true, format: '' },
        {
          label: 'Number Of Scan',
          jpath: ['info', 'numberOfScans'],
          visible: true,
          format: '0',
        },

        {
          label: 'Pulse Sequence',
          jpath: ['info', 'pulseSequence'],
          visible: true,
          format: '',
        },
        {
          label: 'Frequency',
          jpath: ['info', 'originFrequency'],
          visible: true,
          format: '0',
        },
      ],
    },
    onLoadProcessing: {
      '1H': [
        {
          name: 'digitalFilter',
          label: 'Digital Filter',
          value: {},
          flag: true,
        },
        {
          name: 'apodization',
          label: 'Apodization',
          value: {},
          flag: false,
        },
        {
          name: 'zeroFilling',
          label: 'Zero Filling',
          value: {},
          flag: true,
        },
        {
          name: 'fft',
          label: 'Fast fourier transform',
          value: {},
          flag: true,
        },
        {
          name: 'phaseCorrection',
          label: 'Phase correction',
          value: {},
          flag: true,
        },
      ],
      '13C': [
        {
          name: 'digitalFilter',
          label: 'Digital Filter',
          value: {},
          flag: true,
        },
        {
          name: 'apodization',
          label: 'Apodization',
          value: {},
          flag: true,
        },
        {
          name: 'zeroFilling',
          label: 'Zero Filling',
          value: {},
          flag: true,
        },
        {
          name: 'fft',
          label: 'Fast fourier transform',
          value: {},
          flag: true,
        },
        {
          name: 'phaseCorrection',
          label: 'Phase correction',
          value: {},
          flag: true,
        },
      ],
    },
    label: 'Snapshots',
    version: 1,
  },
};

export default function SnapshotView(props) {
  return (
    <View
      {...props}
      workspace="snapshots"
      customWorkspaces={customWorkspaces}
    />
  );
}

import type { CustomWorkspaces } from 'nmr-load-save';

import View from './View.js';

const customWorkspaces: CustomWorkspaces = {
  snapshots: {
    display: {
      general: {
        hideGeneralSettings: false,
        experimentalFeatures: {
          display: true,
          visible: true,
        },
        hidePanelOnLoad: false,
      },
      panels: {
        spectraPanel: {
          display: true,
          visible: true,
          open: true,
        },
        informationPanel: {
          display: true,
          visible: true,
          open: false,
        },
        integralsPanel: {
          display: false,
          visible: false,
          open: false,
        },
        rangesPanel: {
          display: true,
          visible: true,
          open: false,
        },
        structuresPanel: {
          display: true,
          visible: true,
          open: false,
        },
        processingsPanel: {
          display: true,
          visible: true,
          open: false,
        },
        zonesPanel: {
          display: true,
          visible: true,
          open: false,
        },
        automaticAssignmentPanel: {
          display: false,
          visible: false,
          open: false,
        },
        databasePanel: {
          display: false,
          visible: false,
          open: false,
        },
        multipleSpectraAnalysisPanel: {
          display: false,
          visible: false,
          open: false,
        },
        peaksPanel: {
          display: false,
          visible: false,
          open: false,
        },
        predictionPanel: {
          display: false,
          visible: false,
          open: false,
        },
        summaryPanel: {
          display: false,
          visible: false,
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
      invert: false,
      popupLoggingLevel: 'info',
      invertScroll: false,
    },
    nuclei: [
      {
        nucleus: '1H',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
      {
        nucleus: '13C',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
      {
        nucleus: '15N',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
      {
        nucleus: '19F',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
      {
        nucleus: '29Si',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
      {
        nucleus: '31P',
        ppmFormat: '0.00',
        hzFormat: '0.00',
      },
    ],
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
                description: 'Spectrum Name',
                jpath: ['info', 'name'],
                visible: true,
              },
              {
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
                label: 'Spectrum Name',
                description: 'Spectrum Name',
                jpath: ['info', 'name'],
                visible: true,
              },
              {
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
                label: 'Spectrum Name',
                description: 'Spectrum Name',
                jpath: ['info', 'name'],
                visible: true,
              },
              {
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
                label: 'Spectrum Name',
                description: 'Spectrum Name',
                jpath: ['info', 'name'],
                visible: true,
              },
              {
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
            isSumConstant: false,
            showAssignment: false,
            showAssignmentLabel: false,
            showSerialNumber: false,
            showDeleteAction: false,
            showEditAction: false,
            showMultiplicity: false,
            showZoomAction: false,
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
            isSumConstant: false,
            showAssignment: false,
            showAssignmentLabel: false,
            showSerialNumber: false,
            showDeleteAction: false,
            showEditAction: false,
            showMultiplicity: false,
            showZoomAction: false,
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
      position: { x: 0, y: 0 },
      fields: [
        { label: 'Name', jpath: ['info', 'name'], visible: true, format: '' },
        {
          label: 'Number of scans',
          jpath: ['info', 'numberOfScans'],
          visible: true,
          format: '0',
        },

        {
          label: 'Pulse sequence',
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
      autoProcessing: true,
      filters: {
        '1H': [
          {
            name: 'digitalFilter',

            enabled: true,
          },
          {
            name: 'apodization',

            enabled: false,
          },
          {
            name: 'zeroFilling',

            enabled: true,
          },
          {
            name: 'fft',

            enabled: true,
          },
          {
            name: 'phaseCorrection',

            enabled: true,
          },
        ],
        '13C': [
          {
            name: 'digitalFilter',

            enabled: true,
          },
          {
            name: 'apodization',

            enabled: true,
          },
          {
            name: 'zeroFilling',

            enabled: true,
          },
          {
            name: 'fft',

            enabled: true,
          },
          {
            name: 'phaseCorrection',

            enabled: true,
          },
        ],
      },
    },
    label: 'Snapshots',
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

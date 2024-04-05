import { CustomWorkspaces } from 'nmr-load-save';

import View from './View';

const customWorkspaces: CustomWorkspaces = {
  benchtop: {
    display: {
      general: {
        hideGeneralSettings: false,
        experimentalFeatures: {
          display: true,
        },
        hidePanelOnLoad: false,
        hideLogs: false,
        hideHelp: false,
        hideMaximize: false,
        hideWorkspaces: false,
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
          open: true,
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
        simulationPanel: {
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
        fftDimension1: true,
        fftDimension2: true,
      },
    },
    general: {
      dimmedSpectraOpacity: 0.1,
      verticalSplitterPosition: '560px',
      verticalSplitterCloseThreshold: 600,
      spectraRendering: 'auto',
      loggingLevel: 'info',
      popupLoggingLevel: 'error',
      invert: false,
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
      panels: {},
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
        {
          label: 'Name',
          jpath: ['info', 'name'],
          visible: true,
          format: '',
        },
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
            label: 'FFT',
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
            label: 'FFT',
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
    },
    spectraColors: {
      oneDimension: [],
      twoDimensions: [
        {
          jpath: ['info', 'experiment'],
          value: 'cosy',
          positiveColor: 'darkblue',
          negativeColor: 'blue',
        },
        {
          jpath: ['info', 'experiment'],
          value: 'noesy',
          positiveColor: 'pink',
          negativeColor: 'yellow',
        },
        {
          jpath: ['info', 'experiment'],
          value: 'roesy',
          positiveColor: 'pink',
          negativeColor: 'yellow',
        },
        {
          jpath: ['info', 'experiment'],
          value: 'tocsy',
          positiveColor: 'green',
          negativeColor: 'yellow',
        },
        {
          jpath: ['info', 'experiment'],
          value: 'hsqc',
          positiveColor: 'black',
          negativeColor: 'yellow',
        },
        {
          jpath: ['info', 'experiment'],
          value: 'hmbc',
          positiveColor: 'darkviolet',
          negativeColor: 'yellow',
        },
      ],
    },
    version: 2,
    label: 'Simple NMR analysis',
    visible: true,
    source: 'predefined',
  },
};

export default function BenchtopNMRWorkspace(props) {
  return (
    <View {...props} workspace="benchtop" customWorkspaces={customWorkspaces} />
  );
}

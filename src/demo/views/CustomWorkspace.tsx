import { CustomWorkspaces } from 'nmr-load-save';

import View from './View';

const customWorkspaces: CustomWorkspaces = {
  metabo: {
    display: {
      general: {
        hideGeneralSettings: false,
        experimentalFeatures: { display: false },
        hidePanelOnLoad: false,
      },
      panels: {
        spectraPanel: { display: true, open: true },
        informationPanel: { display: true, open: false },
        integralsPanel: { display: false, open: false },
        rangesPanel: { display: false, open: false },
        structuresPanel: { display: false, open: false },
        processingsPanel: { display: false, open: false },
        zonesPanel: { display: false, open: false },
        automaticAssignmentPanel: { display: false, open: false },
        databasePanel: { display: true, open: false },
        multipleSpectraAnalysisPanel: { display: true, open: true },
        peaksPanel: { display: false, open: false },
        predictionPanel: { display: false, open: false },
        summaryPanel: { display: false, open: false },
        matrixGenerationPanel: { display: true },
      },
      toolBarButtons: {
        baselineCorrection: false,
        exclusionZones: true,
        exportAs: true,
        fft: false,
        import: true,
        integral: false,
        multipleSpectraAnalysis: true,
        phaseCorrection: false,
        rangePicking: false,
        realImaginary: false,
        slicing: false,
        spectraCenterAlignments: false,
        spectraStackAlignments: true,
        apodization: false,
        zeroFilling: false,
        zonePicking: false,
        zoomOut: true,
        zoom: true,
        peakPicking: false,
        autoRangeAndZonePicking: false,
      },
    },
    general: {
      dimmedSpectraOpacity: 0.1,
      verticalSplitterPosition: '560px',
      verticalSplitterCloseThreshold: 600,
      spectraRendering: 'auto',
      loggingLevel: 'info',
    },
    formatting: {
      nuclei: {
        '1h': { name: '1H', ppm: '0.00', hz: '0.00' },
        '13c': { name: '13C', ppm: '0.00', hz: '0.00' },
        '15n': { name: '15N', ppm: '0.00', hz: '0.00' },
        '19f': { name: '19F', ppm: '0.00', hz: '0.00' },
        '29si': { name: '29Si', ppm: '0.00', hz: '0.00' },
        '31p': { name: '31P', ppm: '0.00', hz: '0.00' },
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
        keep2D: false,
        onlyReal: true,
        dataSelection: 'preferFT',
      },
      bruker: {
        onlyFirstProcessedData: true,
        processingNumbers: '',
        experimentNumbers: '',
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
        { name: 'apodization', label: 'Apodization', value: {}, flag: false },
        { name: 'zeroFilling', label: 'Zero Filling', value: {}, flag: true },
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
        { name: 'apodization', label: 'Apodization', value: {}, flag: true },
        { name: 'zeroFilling', label: 'Zero Filling', value: {}, flag: true },
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
    label: 'Metabolomics',
    version: 1,
  },
};

export default function CustomWorkspace(props) {
  return (
    <View {...props} workspace="metabo" customWorkspaces={customWorkspaces} />
  );
}

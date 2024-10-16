import { CustomWorkspaces } from 'nmr-load-save';

import View from './View.js';

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
      invert: false,
      popupLoggingLevel: 'info',
    },
    nuclei: [
      { nucleus: '1H', ppmFormat: '0.00', hzFormat: '0.00' },
      { nucleus: '13C', ppmFormat: '0.00', hzFormat: '0.00' },
      { nucleus: '15N', ppmFormat: '0.00', hzFormat: '0.00' },
      { nucleus: '19F', ppmFormat: '0.00', hzFormat: '0.00' },
      { nucleus: '29Si', ppmFormat: '0.00', hzFormat: '0.00' },
      { nucleus: '31P', ppmFormat: '0.00', hzFormat: '0.00' },
    ],
    panels: {},
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
    },
    label: 'Metabolomics',
  },
};

export default function CustomWorkspace(props) {
  return (
    <View {...props} workspace="metabo" customWorkspaces={customWorkspaces} />
  );
}

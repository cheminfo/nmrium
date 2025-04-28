import type { CustomWorkspaces } from '@zakodium/nmrium-core';

import View from './View.js';

const customWorkspaces: CustomWorkspaces = {
  metabo: {
    display: {
      general: {
        hideGeneralSettings: false,
        experimentalFeatures: { display: false, visible: false },
        hidePanelOnLoad: false,
      },
      panels: {
        spectraPanel: { display: true, visible: true, open: true },
        informationPanel: { display: true, visible: true, open: false },
        integralsPanel: { display: false, visible: false, open: false },
        rangesPanel: { display: false, visible: false, open: false },
        structuresPanel: { display: false, visible: false, open: false },
        processingsPanel: { display: false, visible: false, open: false },
        zonesPanel: { display: false, visible: false, open: false },
        automaticAssignmentPanel: {
          display: false,
          visible: false,
          open: false,
        },
        databasePanel: { display: true, visible: true, open: false },
        multipleSpectraAnalysisPanel: {
          display: true,
          visible: true,
          open: true,
        },
        peaksPanel: { display: false, visible: false, open: false },
        predictionPanel: { display: false, visible: false, open: false },
        summaryPanel: { display: false, visible: false, open: false },
        matrixGenerationPanel: { display: true, visible: true },
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
      invertScroll: false,
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

            enabled: true,
          },
          { name: 'apodization', enabled: false },
          { name: 'zeroFilling', enabled: true },
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
          { name: 'apodization', enabled: true },
          { name: 'zeroFilling', enabled: true },
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
    label: 'Metabolomics',
  },
};

export default function CustomWorkspace(props) {
  return (
    <View {...props} workspace="metabo" customWorkspaces={customWorkspaces} />
  );
}

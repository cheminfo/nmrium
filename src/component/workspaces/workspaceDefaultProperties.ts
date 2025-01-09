import type { WorkspacePreferences } from 'nmr-load-save';
import { Filters1D } from 'nmr-processing';

import { color2D } from '../../data/data2d/Spectrum2D/get2DColor.js';

export const workspaceDefaultProperties: Required<WorkspacePreferences> = {
  display: {
    general: {
      hideGeneralSettings: false,
      experimentalFeatures: { display: false, visible: true },
      hidePanelOnLoad: false,
      hideLogs: false,
      hideHelp: false,
      hideMaximize: false,
      hideWorkspaces: false,
    },

    panels: {
      spectraPanel: { display: false, visible: false, open: false },
      informationPanel: { display: false, visible: false, open: false },
      integralsPanel: { display: false, visible: false, open: false },
      rangesPanel: { display: false, visible: false, open: false },
      structuresPanel: { display: false, visible: false, open: false },
      processingsPanel: { display: false, visible: false, open: false },
      zonesPanel: { display: false, visible: false, open: false },
      automaticAssignmentPanel: { display: false, visible: false, open: false },
      databasePanel: { display: false, visible: false, open: false },
      multipleSpectraAnalysisPanel: {
        display: false,
        visible: false,
        open: false,
      },
      peaksPanel: { display: false, visible: false, open: false },
      predictionPanel: { display: false, visible: false, open: false },
      summaryPanel: { display: false, visible: false, open: false },
      simulationPanel: { display: false, visible: false, open: false },
    },
    toolBarButtons: {
      baselineCorrection: false,
      exclusionZones: false,
      exportAs: false,
      fft: false,
      import: false,
      integral: false,
      multipleSpectraAnalysis: false,
      phaseCorrection: false,
      rangePicking: false,
      realImaginary: false,
      slicing: false,
      spectraCenterAlignments: false,
      spectraStackAlignments: false,
      apodization: false,
      zeroFilling: false,
      zonePicking: false,
      zoomOut: false,
      zoom: false,
      peakPicking: false,
      autoRangeAndZonePicking: false,
      fftDimension1: false,
      fftDimension2: false,
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
    position: { x: 0, y: 0 },
  },
  onLoadProcessing: {
    autoProcessing: true,
    filters: {
      '1H': [
        {
          name: Filters1D.digitalFilter.name,

          enabled: true,
        },
        {
          name: Filters1D.apodization.name,

          enabled: false,
        },
        {
          name: Filters1D.zeroFilling.name,

          enabled: true,
        },
        {
          name: Filters1D.fft.name,

          enabled: true,
        },
        {
          name: Filters1D.phaseCorrection.name,

          enabled: true,
        },
      ],
      '13C': [
        {
          name: Filters1D.digitalFilter.name,

          enabled: true,
        },
        {
          name: Filters1D.apodization.name,

          enabled: true,
        },
        {
          name: Filters1D.zeroFilling.name,

          enabled: true,
        },
        {
          name: Filters1D.fft.name,

          enabled: true,
        },
        {
          name: Filters1D.phaseCorrection.name,

          enabled: true,
        },
      ],
    },
  },
  spectraColors: {
    highlightColor: '#ffd70080',
    oneDimension: [],
    twoDimensions: [
      {
        jpath: ['info', 'experiment'],
        value: 'cosy',
        ...color2D.cosy,
      },
      {
        jpath: ['info', 'experiment'],
        value: 'noesy',
        ...color2D.noesy,
      },
      {
        jpath: ['info', 'experiment'],
        value: 'roesy',
        ...color2D.roesy,
      },
      {
        jpath: ['info', 'experiment'],
        value: 'tocsy',
        ...color2D.tocsy,
      },
      {
        jpath: ['info', 'experiment'],
        value: 'hsqc',
        ...color2D.hsqc,
      },
      {
        jpath: ['info', 'experiment'],
        value: 'hmbc',
        ...color2D.hmbc,
      },
    ],
  },
  printPageOptions: {},
  externalAPIs: [],
  export: {
    png: {
      mode: 'basic',
      dpi: 300,
      size: 'A5',
      layout: 'landscape',
      useDefaultSettings: false,
    },
    svg: {
      mode: 'basic',
      dpi: 300,
      size: 'A5',
      layout: 'landscape',
      useDefaultSettings: false,
    },
    clipboard: {
      mode: 'basic',
      dpi: 300,
      size: 'A5',
      layout: 'landscape',
      useDefaultSettings: false,
    },
  },
  peaksLabel: {
    marginTop: 0,
  },
};

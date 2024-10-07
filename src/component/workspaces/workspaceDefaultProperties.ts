import { WorkspacePreferences } from 'nmr-load-save';
import { Filters } from 'nmr-processing';

import { color2D } from '../../data/data2d/Spectrum2D/get2DColor';

export const workspaceDefaultProperties: Required<WorkspacePreferences> = {
  display: {
    general: {
      hideGeneralSettings: false,
      experimentalFeatures: { display: false },
      hidePanelOnLoad: false,
      hideLogs: false,
      hideHelp: false,
      hideMaximize: false,
      hideWorkspaces: false,
    },

    panels: {
      spectraPanel: { display: false, open: false },
      informationPanel: { display: false, open: false },
      integralsPanel: { display: false, open: false },
      rangesPanel: { display: false, open: false },
      structuresPanel: { display: false, open: false },
      processingsPanel: { display: false, open: false },
      zonesPanel: { display: false, open: false },
      automaticAssignmentPanel: { display: false, open: false },
      databasePanel: { display: false, open: false },
      multipleSpectraAnalysisPanel: { display: false, open: false },
      peaksPanel: { display: false, open: false },
      predictionPanel: { display: false, open: false },
      summaryPanel: { display: false, open: false },
      simulationPanel: { display: false, open: false },
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
          name: Filters.digitalFilter.id,
          label: Filters.digitalFilter.name,
          value: {},
          flag: true,
        },
        {
          name: Filters.apodization.id,
          label: Filters.apodization.name,
          value: {},
          flag: false,
        },
        {
          name: Filters.zeroFilling.id,
          label: Filters.zeroFilling.name,

          value: {},
          flag: true,
        },
        {
          name: Filters.fft.id,
          label: Filters.fft.name,

          value: {},
          flag: true,
        },
        {
          name: Filters.phaseCorrection.id,
          label: Filters.phaseCorrection.name,

          value: {},
          flag: true,
        },
      ],
      '13C': [
        {
          name: Filters.digitalFilter.id,
          label: Filters.digitalFilter.name,

          value: {},
          flag: true,
        },
        {
          name: Filters.apodization.id,
          label: Filters.apodization.name,
          value: {},
          flag: true,
        },
        {
          name: Filters.zeroFilling.id,
          label: Filters.zeroFilling.name,

          value: {},
          flag: true,
        },
        {
          name: Filters.fft.id,
          label: Filters.fft.name,

          value: {},
          flag: true,
        },
        {
          name: Filters.phaseCorrection.id,
          label: Filters.phaseCorrection.name,

          value: {},
          flag: true,
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
      dpi: 300,
      width: 21,
      height: 14.8,
      unit: 'cm',
      useDefaultSettings: false,
    },
    svg: {
      dpi: 300,
      width: 21,
      height: 14.8,
      unit: 'cm',
      useDefaultSettings: false,
    },
    clipboard: {
      dpi: 300,
      width: 21,
      height: 14.8,
      unit: 'cm',
      useDefaultSettings: false,
    },
  },
};

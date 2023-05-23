import * as Filters from '../../data/Filters';

import { WorkspacePreferences } from './Workspace';

export const workspaceDefaultProperties: Required<WorkspacePreferences> = {
  display: {
    general: {
      hideGeneralSettings: false,
      experimentalFeatures: { display: false },
      hidePanelOnLoad: false,
      hideLogs: false,
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
      { label: 'name', jpath: ['display', 'name'], visible: true },
      {
        label: 'Number Of Scan',
        jpath: ['info', 'numberOfScans'],
        visible: true,
      },
      {
        label: 'Acquisition Time',
        jpath: ['info', 'acquisitionTime'],
        visible: true,
      },
      {
        label: 'Pulse Sequence',
        jpath: ['info', 'pulseSequence'],
        visible: true,
      },
    ],
  },
  onLoadProcessing: {
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
};

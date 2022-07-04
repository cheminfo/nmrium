import { Workspace } from './Workspace';

export const basic: Workspace = {
  version: 1,
  label: 'Default workspace',
  display: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
      hideGeneralSettings: false,
      experimentalFeatures: { display: false },
    },

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: false, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
      summaryPanel: { display: false, open: false },
      multipleSpectraAnalysisPanel: { display: false, open: false },
      databasePanel: { display: false, open: false },
      predictionPanel: { display: false, open: false },
      automaticAssignmentPanel: { display: false, open: false },
    },
    toolBarButtons: {
      peakTool: false,
      baseLineCorrectionTool: true,
      exclusionZonesTool: true,
      exportAs: true,
      FFTTool: true,
      import: true,
      integralTool: true,
      multipleSpectraAnalysisTool: true,
      phaseCorrectionTool: true,
      rangePickingTool: true,
      realImaginary: true,
      slicingTool: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zeroFillingTool: true,
      zonePickingTool: true,
      zoomOutTool: true,
      zoomTool: true,
    },
  },

  controllers: {
    dimmedSpectraTransparency: 0.1,
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
  databases: [
    {
      label: 'Toc',
      url: 'https://data.cheminfo.org/nmr/database/toc.json',
      enabled: true,
    },
  ],
};

import { Workspace } from './Workspace';

export const basic: Workspace = {
  version: 1,
  label: 'Default workspace',
  display: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
      hideGeneralSettings: false,
      experimentalFeatures: { display: true },
    },

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: true, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
      summaryPanel: { display: false, open: false },
      multipleSpectraAnalysisPanel: { display: false, open: false },
      databasePanel: { display: false, open: false },
      predictionPanel: { display: false, open: false },
    },
  },

  controllers: {
    dimmedSpectraTransparency: 0.1,
  },
  formatting: {
    nucleus: [
      { key: '1H', name: '1H', ppm: '0.00', hz: '0.00' },
      { key: '13C', name: '13C', ppm: '0.00', hz: '0.00' },
      { key: '15N', name: '15N', ppm: '0.00', hz: '0.00' },
      { key: '19F', name: '19F', ppm: '0.00', hz: '0.00' },
      { key: '29Si', name: '29Si', ppm: '0.00', hz: '0.00' },
      { key: '31P', name: '31P', ppm: '0.00', hz: '0.00' },
    ],
    nucleusByKey: {},
    panels: {},
  },
};

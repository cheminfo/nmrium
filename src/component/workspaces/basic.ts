import { Workspace } from './Workspace';

export const basic: Workspace = {
  version: 1,
  label: 'Default Mode',
  display: {
    general: {
      disableMultipletAnalysis: false,
      hideSetSumFromMolecule: false,
      hideGeneralSettings: false,
      experimentalFeatures: true,
    },

    panels: {
      spectraPanel: true,
      informationPanel: true,
      peaksPanel: true,
      integralsPanel: true,
      rangesPanel: true,
      structuresPanel: true,
      filtersPanel: true,
      zonesPanel: true,
      summaryPanel: false,
      multipleSpectraAnalysisPanel: false,
      databasePanel: false,
      predictionPanel: false,
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

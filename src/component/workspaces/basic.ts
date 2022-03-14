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
};

import { Workspace } from './Workspace';

export const prediction: Workspace = {
  version: 1,
  label: 'Prediction Mode',
  display: {
    general: {
      experimentalFeatures: false,
    },
    panels: {
      spectraPanel: true,
      rangesPanel: true,
      zonesPanel: true,
      predictionPanel: true,
      informationPanel: false,
      peaksPanel: false,
      integralsPanel: false,
      structuresPanel: false,
      filtersPanel: false,
      summaryPanel: false,
      multipleSpectraAnalysisPanel: false,
      databasePanel: false,
    },
  },
};

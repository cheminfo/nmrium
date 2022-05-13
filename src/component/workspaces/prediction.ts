import { Workspace } from './Workspace';
import { basic } from './basic';

export const prediction: Workspace = {
  version: 1,
  label: 'Prediction workspace',
  display: {
    general: {
      experimentalFeatures: { display: false },
    },
    panels: {
      spectraPanel: { display: true },
      rangesPanel: { display: true },
      zonesPanel: { display: true },
      predictionPanel: { display: true, open: true },
      informationPanel: { display: false },
      peaksPanel: { display: false },
      integralsPanel: { display: false },
      structuresPanel: { display: false },
      filtersPanel: { display: false },
      summaryPanel: { display: false },
      multipleSpectraAnalysisPanel: { display: false },
      databasePanel: { display: false },
      automaticAssignmentPanel: { display: false },
    },
  },
  controllers: basic.controllers,
  formatting: basic.formatting,
  databases: basic.databases,
};
